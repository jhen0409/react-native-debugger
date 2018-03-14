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

const currentWindow = remote.getCurrentWindow();
const { SET_DEBUGGER_LOCATION, BEFORE_WINDOW_CLOSE } = debuggerActions;

let worker;
let actions;
let host;
let port;
let socket;

const workerOnMessage = message => {
  const { data } = message;
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

const createJSRuntime = () => {
  // This worker will run the application javascript code,
  // making sure that it's run in an environment without a global
  // document, to make it consistent with the JSC executor environment.
  // eslint-disable-next-line
  worker = new Worker(`${__webpack_public_path__}RNDebuggerWorker.js`);
  worker.addEventListener('message', workerOnMessage);

  actions.setDebuggerWorker(worker, 'connected');
};

const shutdownJSRuntime = () => {
  const { setDebuggerWorker } = actions;
  if (worker) {
    worker.terminate();
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

const connectToDebuggerProxy = async () => {
  const ws = new WebSocket(`ws://${host}:${port}/debugger-proxy?role=debugger&name=Chrome`);

  const { setDebuggerStatus } = actions;
  ws.onopen = () => setDebuggerStatus('waiting');
  ws.onmessage = async message => {
    if (!message.data) {
      return;
    }
    const object = JSON.parse(message.data);

    if (object.$event === 'client-disconnected') {
      shutdownJSRuntime();
      return;
    }

    if (!object.method) {
      return;
    }

    // Special message that asks for a new JS runtime
    if (object.method === 'prepareJSRuntime') {
      shutdownJSRuntime();
      createJSRuntime();
      if (process.env.NODE_ENV !== 'development') {
        console.clear();
        clearNetworkLogs(currentWindow);
      }
      selectRNDebuggerWorkerContext(currentWindow);
      ws.send(JSON.stringify({ replyID: object.id }));
    } else if (object.method === '$disconnected') {
      shutdownJSRuntime();
    } else {
      // Otherwise, pass through to the worker.
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
          const deltaUrl = object.url.replace('index.bundle', 'index.delta');
          await fetch(deltaUrl);
          worker.postMessage({ ...object, url: await deltaUrlToBlobUrl(deltaUrl) });
          return;
        } catch (e) {}
      }
      worker.postMessage(object);
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
  port = packagerPort || 8081;
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
