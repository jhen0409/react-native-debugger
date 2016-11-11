/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

// Take from https://github.com/facebook/react-devtools/blob/master/shells/electron/src/ui.js

/* eslint import/no-extraneous-dependencies: 0 import/no-unresolved: 0 */

import ws from 'ws';
import { connect } from 'react-redux';
import React, { Component, PropTypes } from 'react';

import backendScript from 'raw!../react-devtools/shells/electron/build/backend.js';
import Panel from '../react-devtools/frontend/Panel';

const getNewKey = () => `react-panel${Math.random().toString().substr(2, 10)}`;

const styles = {
  waiting: {
    WebkitUserSelect: 'none',
    textAlign: 'center',
    padding: '30px',
    color: '#aaa',
  },
};

@connect(
  state => ({
    debugger: state.debugger,
  }),
  dispatch => ({ dispatch }),
)
export default class ReactInspector extends Component {
  static propTypes = {
    debugger: PropTypes.object,
  };

  state = {
    connected: false,
    message: 'Waiting for a connection from React Native',
    panelKey: getNewKey(),
    wall: null,
  };

  componentDidMount() {
    if (this.props.debugger.worker) {
      this.server = this.startServer();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { prevWorker } = this.props.debugger;
    const { worker } = nextProps.debugger;
    if (worker && prevWorker !== worker) {
      if (this.server) this.server.close();
      this.server = this.startServer();
    } else if (!worker) {
      if (this.server) this.server.close();
    }
  }

  componentWillUnmount() {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }

  onDisconnected = () => {
    this.setState({ connected: false });
  };

  onError = e => {
    this.setState({
      connected: false,
      message: e.code === 'EADDRINUSE' ?
        'Another instance of DevTools is running' :
        `Unknown error (${e.message})`,
    });
  };

  reload = payload => {
    this.setState({ connected: true, panelKey: getNewKey(), ...payload });
  };

  initialize = socket => {
    socket.send(`eval:${backendScript}`);
    const listeners = [];

    socket.onmessage = evt => {
      if (evt.data === 'attach:agent') {
        return;
      }
      const data = JSON.parse(evt.data);
      if (data.$close || data.$error) {
        this.onDisconnected();
        socket.onmessage = msg => {
          if (msg.data === 'attach:agent') {
            this.initialize(socket);
          }
        };
        return;
      }
      if (data.$open) {
        return; // ignore
      }
      listeners.forEach(fn => fn(data));
    };
    this.reload({
      wall: {
        listen(fn) {
          listeners.push(fn);
        },
        send(data) {
          if (
            data.events &&
            data.events.length &&
            data.events[0].evt === 'hideHighlight'
          ) {
            return;
          }
          socket.send(JSON.stringify(data));
        },
        disconnect() {
          socket.close();
        },
      },
    });
  }

  /**
   * When the Electron app is running in "server mode"
   */
  startServer = (port = 8097) => {
    const options = { port };
    if (process.env.REACT_ONLY_FOR_LOCAL) {
      options.host = 'localhost';
    }
    const server = new ws.Server(options);
    let connected = false;
    server.on('connection', socket => {
      if (connected) {
        console.warn('[React DevTools] Only one connection allowed at a time');
        socket.close();
        return;
      }
      connected = true;
      socket.onerror = err => {
        connected = false;
        this.onDisconnected();
        console.log('[React DevTools] Error with websocket connection', err);
      };
      socket.onclose = () => {
        connected = false;
        this.onDisconnected();
      };
      this.initialize(socket);
    });

    server.on('error', e => {
      this.onError(e);
      console.error('[React DevTools] Failed to start the DevTools server', e);
      this.restartTimeout = setTimeout(() => this.startServer(port), 1000);
    });

    return {
      close: () => {
        connected = false;
        this.onDisconnected();
        clearTimeout(this.restartTimeout);
        server.close();
      },
    };
  }

  renderWaiting() {
    return (
      <h2 style={styles.waiting}>{this.state.message}</h2>
    );
  }

  render() {
    if (!this.state.connected) {
      return this.renderWaiting();
    }
    return (
      <Panel
        key={this.state.panelKey}
        reload={this.reload}
        alreadyFoundReact
        inject={done => done(this.state.wall)}
      />
    );
  }
}
