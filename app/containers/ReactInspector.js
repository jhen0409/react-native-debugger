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

const isReactPanelOpen = props => props.setting.react;

@connect(
  state => ({
    debugger: state.debugger,
    setting: state.setting,
  }),
  dispatch => ({ dispatch })
)
export default class ReactInspector extends Component {
  static propTypes = {
    debugger: PropTypes.object,
    setting: PropTypes.object,
  };

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
    const { worker } = this.props.debugger;
    const { worker: nextWorker } = nextProps.debugger;
    if (nextWorker && nextWorker !== worker) {
      this.closeServerIfExists();
      if (isReactPanelOpen(this.props)) {
        this.server = this.startServer();
        this.setDefaultThemeName(nextProps.setting.themeName);
      }
      nextWorker.addEventListener('message', this.workerOnMessage);
    } else if (!nextWorker) {
      this.closeServerIfExists();
    }
    if (this.props.setting.themeName !== nextProps.setting.themeName) {
      this.setDefaultThemeName(nextProps.setting.themeName);
    }
    // Open / Close server when react panel opened / hidden
    if (!worker && !nextWorker) return;
    if (isReactPanelOpen(this.props) && !isReactPanelOpen(nextProps)) {
      this.closeServerIfExists();
    } else if (!isReactPanelOpen(this.props) && isReactPanelOpen(nextProps)) {
      this.closeServerIfExists();
      this.server = this.startServer();
    }
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount() {
    this.closeServerIfExists();
  }

  setDefaultThemeName(themeName) {
    getReactInspector().setDefaultThemeName(themeName === 'dark' ? 'ChromeDark' : 'ChromeDefault');
  }

  listeningPort = window.reactDevToolsPort;

  workerOnMessage = message => {
    const { data } = message;
    if (!data || !data.__REPORT_REACT_DEVTOOLS_PORT__) return;

    const port = Number(data.__REPORT_REACT_DEVTOOLS_PORT__);
    const platform = data.platform;
    if (port && port !== this.listeningPort) {
      this.listeningPort = port;
      this.closeServerIfExists();
      if (isReactPanelOpen(this.props)) {
        this.server = this.startServer(port);
      }
      if (platform === 'android') tryADBReverse(port).catch(() => {});
    }
  };

  startServer(port = this.listeningPort) {
    let loggedWarn = false;
    return getReactInspector()
      .setBrowserName('RNDebugger DevTools')
      .setStatusListener(status => {
        if (!loggedWarn && status === 'Failed to start the server.') {
          const message =
            port !== 8097
              ? 're-open the debugger window might be helpful.'
              : 'we recommended to upgrade React Native version to 0.39+ for random port support.';
          console.error(
            '[RNDebugger]',
            `Failed to start React DevTools server with port \`${port}\`,`,
            'because another server is listening,',
            message
          );
          loggedWarn = true;
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
          <h2>{'Waiting for React to connect…'}</h2>
          <h5 style={styles.tip}>
            {"If you're using a real device, ensure you have read the "}
            <span style={styles.link} onClick={this.handleDocLinkClick}>
              `How to use it with a real device?`
            </span>
            {' section in the documentation.'}
          </h5>
        </div>
      </div>
    );
  }
}
