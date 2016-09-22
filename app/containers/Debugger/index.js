/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

// Edit from https://github.com/facebook/react-native/blob/master/local-cli/server/util/debugger.html

import WebSocket from 'ws';
import { ipcRenderer } from 'electron';
import { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Worker from 'worker?name=debugger.worker.js!./debuggerWorker'; // eslint-disable-line
import * as debuggerAtions from '../../actions/debugger';

function setStatusToTitle(status, message) {
  document.title = `React Native Debugger - ${message}`;
}

@connect(
  state => ({
    debugger: state.debugger,
  }),
  dispatch => ({
    actions: {
      debugger: bindActionCreators(debuggerAtions, dispatch),
    },
  })
)
export default class Debugger extends Component {
  static propTypes = {
    debugger: PropTypes.object,
    actions: PropTypes.object,
  };

  componentDidMount() {
    this.setDebuggerLoc(JSON.parse(process.env.DEBUGGER_SETTING || '{}'));

    ipcRenderer.on('set-debugger-loc', (e, payload) => {
      this.setDebuggerLoc(JSON.parse(payload));
    });
  }

  componentWillUnmount() {
    this.socket.close();
  }

  setDebuggerLoc({ host, port }) {
    if (this.host === host && this.port === Number(port)) return;

    this.host = host;
    this.port = port;
    if (this.socket) {
      this.socket.close();
    } else {
      this.socket = this.connectToDebuggerProxy();
    }
  }

  connectToDebuggerProxy = () => {
    const host = this.host || 'localhost';
    const port = this.port || 8081;

    const ws = WebSocket.connect(`ws://${host}:${port}/debugger-proxy?role=debugger&name=Chrome`);

    const onmessage = message => {
      if (message.data && message.data.__IS_REDUX_NATIVE_MESSAGE__) {
        return true;
      }
      ws.send(JSON.stringify(message.data));
    };

    const createJSRuntime = () => {
      // This worker will run the application javascript code,
      // making sure that it's run in an environment without a global
      // document, to make it consistent with the JSC executor environment.
      const worker = new Worker();
      worker.addEventListener('message', onmessage);

      this.props.actions.debugger.setDebuggerWorker(worker);
    };

    const shutdownJSRuntime = () => {
      if (this.props.debugger.worker) {
        this.props.debugger.worker.terminate();
        this.props.actions.debugger.setDebuggerWorker(null);
      }
    };

    ws.onopen = () => {
      const { statusMessage } = this.props.debugger;
      this.props.actions.debugger.setDebuggerStatus(statusMessage);
      setStatusToTitle('waiting', statusMessage);
    };

    ws.onmessage = message => {
      if (!message.data) {
        return;
      }
      const { statusMessage } = this.props.debugger;
      const object = JSON.parse(message.data);

      if (object.$event === 'client-disconnected') {
        shutdownJSRuntime();
        setStatusToTitle('waiting', statusMessage);
        return;
      }

      if (!object.method) {
        return;
      }

      // Special message that asks for a new JS runtime
      if (object.method === 'prepareJSRuntime') {
        shutdownJSRuntime();
        if (process.env.NODE_ENV !== 'development') {
          console.clear();
        }
        createJSRuntime();
        ws.send(JSON.stringify({ replyID: object.id }));
        setStatusToTitle('connected', `Debugger session #${object.id} active.`);
      } else if (object.method === '$disconnected') {
        shutdownJSRuntime();
        setStatusToTitle('waiting', statusMessage);
      } else {
        // Otherwise, pass through to the worker.
        const { worker } = this.props.debugger;
        if (worker) {
          worker.postMessage(object);
        }
      }
    };

    ws.onerror = () => {};
    ws.onclose = e => {
      shutdownJSRuntime();
      setStatusToTitle(
        'disconnected',
        'Disconnected from proxy. Attempting reconnection. Is node server running?'
      );
      if (e.reason) {
        setStatusToTitle(e.reason);
        console.warn(e.reason);
      }
      setTimeout(() => {
        this.socket = this.connectToDebuggerProxy();
      }, 500);
    };
    return ws;
  }

  render() {
    return null;
  }
}
