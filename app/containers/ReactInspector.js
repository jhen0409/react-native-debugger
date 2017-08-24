/* eslint import/no-extraneous-dependencies: 0 import/no-unresolved: 0 */

import { connect } from 'react-redux';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { shell } from 'electron';
import { tryADBReverse } from '../utils/adb';

let ReactServer;
const getReactInspector = () => {
  if (ReactServer) return ReactServer;
  // eslint-disable-next-line
  ReactServer = ReactServer || require('react-devtools-core/standalone');

  return ReactServer;
};
const containerId = 'react-devtools-container';

const styles = {
  container: {
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
  },
  tip: {
    lineHeight: 1.5,
  },
  link: {
    cursor: 'pointer',
    color: '#777',
  },
};

// Avoid errors
const originErr = console.error;
console.error = (...args) => {
  if (args[0] === '[React DevTools]') {
    return;
  }
  return originErr(...args);
};

@connect(
  state => ({
    debugger: state.debugger,
  }),
  dispatch => ({ dispatch })
)
export default class ReactInspector extends Component {
  static propTypes = {
    debugger: PropTypes.object,
  };

  static setDefaultThemeName(themeName) {
    getReactInspector().setDefaultThemeName(themeName === 'dark' ? 'ChromeDark' : 'ChromeDefault');
  }

  static setProjectRoots(projectRoots) {
    getReactInspector().setProjectRoots(projectRoots);
  }

  componentDidMount() {
    const { worker } = this.props.debugger;
    if (worker) {
      this.server = this.startServer();
      worker.addEventListener('message', this.workerOnMessage);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { prevWorker } = this.props.debugger;
    const { worker } = nextProps.debugger;
    if (worker && prevWorker !== worker) {
      this.closeServerIfExists();
      this.server = this.startServer();
      worker.addEventListener('message', this.workerOnMessage);
    } else if (!worker) {
      this.closeServerIfExists();
    }
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount() {
    this.closeServerIfExists();
  }

  listeningPort = window.reactDevToolsPort;
  loggedWarn = false;

  workerOnMessage = message => {
    const { data } = message;
    if (!data || !data.__REPORT_REACT_DEVTOOLS_PORT__) return;

    const port = Number(data.__REPORT_REACT_DEVTOOLS_PORT__);
    const platform = data.platform;
    if (port && port !== this.listeningPort) {
      this.listeningPort = port;
      this.closeServerIfExists();
      this.server = this.startServer(port);
      if (platform === 'android') tryADBReverse(port).catch(() => {});
    }
  };

  startServer(port = this.listeningPort) {
    return getReactInspector()
      .setBrowserName('RNDebugger DevTools')
      .setStatusListener(status => {
        if (!this.loggedWarn && port === 8097 && status === 'Failed to start the server.') {
          console.warn(
            '[RNDebugger]',
            'Failed to start React DevTools server with port `8097`,',
            'because another instance of DevTools is listening,',
            'we recommended to upgrade React Native version to 0.39+ for random port support.'
          );
          this.loggedWarn = true;
        }
      })
      .setContentDOMNode(document.getElementById(containerId))
      .startServer(port);
  }

  closeServerIfExists = () => {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  };

  handleDocLinkClick = () =>
    shell.openExternal(
      'https://github.com/jhen0409/react-native-debugger/blob/master/docs/react-devtools-integration.md#how-to-use-it-with-real-device'
    );

  render() {
    return (
      <div id={containerId} style={styles.container}>
        <div id="waiting">
          <h2>
            {'Waiting for React to connect…'}
          </h2>
          <h5 style={styles.tip}>
            {"If you're using real device, to ensure you have read "}
            <span style={styles.link} onClick={this.handleDocLinkClick}>
              `How to use it with real device?`
            </span>
            {' section in documentation.'}
          </h5>
        </div>
      </div>
    );
  }
}
