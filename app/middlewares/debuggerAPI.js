/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

// Take from https://github.com/facebook/react-native/blob/master/local-cli/server/util/debugger.html

import { remote } from 'electron';
import { bindActionCreators } from 'redux';
import { checkPortStatus } from 'portscanner';
import * as debuggerActions from '../actions/debugger';
import { setDevMenuMethods, networkInspect } from '../utils/devMenu';
import { tryADBReverse } from '../utils/adb';
import { clearNetworkLogs, selectRNDebuggerWorkerContext } from '../utils/devtools';
import deltaUrlToBlobUrl from './delta/deltaUrlToBlobUrl';
import checkDeltaAvailable from './delta/checkDeltaAvailable';

const currentWindow = remote.getCurrentWindow();
const { SET_DEBUGGER_LOCATION, BEFORE_WINDOW_CLOSE } = debuggerActions;

let worker;
let queuedMessages = [];
let scriptExecuted = false;
let actions;
let host;
let port;
let socket;

const APOLLO_BACKEND = 'apollo-devtools-backend';
const APOLLO_PROXY = 'apollo-devtools-proxy';

const workerOnMessage = message => {
  const { data } = message;

  if (data && data.source === APOLLO_BACKEND) {
    if (!window.__APOLLO_DEVTOOLS_SHOULD_DISPLAY_PANEL__) {
      window.__APOLLO_DEVTOOLS_SHOULD_DISPLAY_PANEL__ = true;
    }

    postMessage(
      {
        source: APOLLO_BACKEND,
        payload: data,
      },
      '*'
    );
  }

  if (data && (data.__IS_REDUX_NATIVE_MESSAGE__ || data.__REPORT_REACT_DEVTOOLS_PORT__)) {
    return true;
  }
  const list = data && data.__AVAILABLE_METHODS_CAN_CALL_BY_RNDEBUGGER__;
  if (list) {
    setDevMenuMethods(list, worker);
    return false;
  }
  socket.send(JSON.stringify(data));
};

const onWindowMessage = e => {
  const { data } = e;
  if (data && data.source === APOLLO_PROXY) {
    const message = typeof data.payload === 'string' ? { event: data.payload } : data.payload;
    worker.postMessage({ source: APOLLO_PROXY, ...message });
  }
};

const createJSRuntime = () => {
  // This worker will run the application javascript code,
  // making sure that it's run in an environment without a global
  // document, to make it consistent with the JSC executor environment.
  // eslint-disable-next-line
  worker = new Worker(`${__webpack_public_path__}RNDebuggerWorker.js`);
  worker.addEventListener('message', workerOnMessage);
  window.addEventListener('message', onWindowMessage);
  actions.setDebuggerWorker(worker, 'connected');
};

const shutdownJSRuntime = () => {
  const { setDebuggerWorker } = actions;
  scriptExecuted = false;
  if (worker) {
    worker.terminate();
    window.removeEventListener('messsage', onWindowMessage);
    setDevMenuMethods([]);
  }
  worker = null;
  setDebuggerWorker(null, 'disconnected');
};

const isScriptBuildForAndroid = url =>
  url && (url.indexOf('.android.bundle') > -1 || url.indexOf('platform=android') > -1);

let preconnectTimeout;
const preconnect = async (fn, firstTimeout) => {
  if (firstTimeout || (await checkPortStatus(port, host)) !== 'open') {
    preconnectTimeout = setTimeout(() => preconnect(fn), 500);
    return;
  }
  socket = await fn();
};

const clearLogs = () => {
  if (process.env.NODE_ENV !== 'development') {
    console.clear();
    clearNetworkLogs(currentWindow);
  }
};

const flushQueuedMessages = () => {
  if (!worker) return;
  // Flush any messages queued up and clear them
  queuedMessages.forEach(message => worker.postMessage(message));
  queuedMessages = [];
};

const connectToDebuggerProxy = async () => {
  const ws = new WebSocket(`ws://${host}:${port}/debugger-proxy?role=debugger&name=Chrome`);

  const { setDebuggerStatus } = actions;
  ws.onopen = () => setDebuggerStatus('waiting');
  ws.onmessage = async message => {
    if (!message.data) return;

    const object = JSON.parse(message.data);
    if (object.$event === 'client-disconnected') {
      shutdownJSRuntime();
      return;
    }
    if (!object.method) return;

    // Special message that asks for a new JS runtime
    if (object.method === 'prepareJSRuntime') {
      shutdownJSRuntime();
      createJSRuntime();
      clearLogs();
      selectRNDebuggerWorkerContext(currentWindow);
      ws.send(JSON.stringify({ replyID: object.id }));
    } else if (object.method === '$disconnected') {
      shutdownJSRuntime();
    } else {
      if (!worker) return;
      if (object.method === 'executeApplicationScript') {
        object.networkInspect = networkInspect.isEnabled();
        object.reactDevToolsPort = window.reactDevToolsPort;
        if (isScriptBuildForAndroid(object.url)) {
          // Reserve React Inspector port for debug via USB on Android real device
          tryADBReverse(window.reactDevToolsPort).catch(() => {});
        }
        // Check Delta support
        try {
          if (await checkDeltaAvailable(host, port)) {
            const { url, moduleSize } = await deltaUrlToBlobUrl(
              object.url.replace('.bundle', '.delta')
            );
            object.moduleSize = moduleSize;
            clearLogs();
            scriptExecuted = true;
            worker.postMessage({ ...object, url });
            flushQueuedMessages();
            return;
          }
        } finally {
          // Clear logs even if no error catched
          clearLogs();
          scriptExecuted = true;
        }
      }
      if (scriptExecuted) {
        // Otherwise, pass through to the worker provided the
        // application script has been executed. If not add
        // it to a queue until it has been executed.
        worker.postMessage(object);
        flushQueuedMessages();
      } else {
        queuedMessages.push(object);
      }
    }
  };

  ws.onerror = () => {};
  ws.onclose = e => {
    shutdownJSRuntime();
    if (e.reason) {
      console.warn(e.reason);
    }
    preconnect(connectToDebuggerProxy, true);
  };
  return ws;
};

const setDebuggerLoc = ({ host: packagerHost, port: packagerPort }) => {
  if (host === packagerHost && port === Number(packagerPort)) return;

  host = packagerHost || 'localhost';
  port = packagerPort || window.query.port || 8081;
  if (socket) {
    shutdownJSRuntime();
    socket.close();
  } else {
    // Should ensure cleared timeout if called preconnect twice
    clearTimeout(preconnectTimeout);
    preconnect(connectToDebuggerProxy);
  }
};

export default ({ dispatch }) => {
  actions = bindActionCreators(debuggerActions, dispatch);

  return next => action => {
    if (action.type === SET_DEBUGGER_LOCATION) {
      setDebuggerLoc(action.loc);
    }
    if (action.type === BEFORE_WINDOW_CLOSE) {
      // Reture boolean instead of handle reducer
      if (!worker) return false;
      worker.postMessage({ method: 'beforeTerminate' });
      return true;
    }
    return next(action);
  };
};
