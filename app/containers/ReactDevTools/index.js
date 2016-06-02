/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

// Edit from https://github.com/facebook/react-devtools/blob/master/shells/electron/src/ui.js

import ws from 'ws';

import installGlobalHook from 'react-devtools/backend/installGlobalHook';
installGlobalHook(window);

import React, { Component } from 'react';
import Panel from 'react-devtools/frontend/Panel';

import backendScript from 'raw!react-devtools/shells/electron/build/backend.js';

const getNewKey = () => 'p' + Math.random().toString().substr(2, 10);

const styles = {
  waiting: {
    '-webkit-user-select': 'none',
    textAlign: 'center',
    padding: '30px',
    color: '#aaa',
  },
};

export default class ReactDevTools extends Component {
  state = {
    connected: false,
    message: 'Waiting for a connection from React Native',
    panelKey: getNewKey(),
    wall: null,
  };

  componentDidMount() {
    this.server = this.startServer();
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
    let message;
    if (e.code === 'EADDRINUSE') {
      message = 'Another instance of DevTools is running';
    } else {
      message = `Unknown error (${e.message})`;
    }
    this.setState({ connected: false, message });
  };

  reload = payload => {
    this.setState({ connected: true, panelKey: getNewKey(), ...payload });
  };

  initialize = socket => {
    socket.send('eval:' + backendScript);
    const listeners = [];

    socket.onmessage = evt => {
      if (evt.data === 'attach:agent') {
        return;
      }
      const data = JSON.parse(evt.data);
      if (data.$close || data.$error) {
        if (this.onDisconnected) this.onDisconnected();
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
    const server = new ws.Server({ port });
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
        if (this.onDisconnected) this.onDisconnected();
        console.log('[React DevTools] Error with websocket connection', err);
      };
      socket.onclose = () => {
        connected = false;
        if (this.onDisconnected) this.onDisconnected();
      };
      this.initialize(socket);
    });

    server.on('error', e => {
      this.onError(e);
      console.error('[React DevTools] Failed to start the DevTools server', e);
      this.restartTimeout = setTimeout(() => this.startServer(port), 1000);
    });

    return {
      close() {
        connected = false;
        if (this.onDisconnected) this.onDisconnected();
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
