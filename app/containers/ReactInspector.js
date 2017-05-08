/* eslint import/no-extraneous-dependencies: 0 import/no-unresolved: 0 */

import { connect } from 'react-redux';
import React, { Component, PropTypes } from 'react';
import ReactServer from 'react-devtools-core/standalone';
import { tryADBReverse } from '../utils/adb';

const containerId = 'react-devtools-container';

const styles = {
  container: {
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
  },
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

  workerOnMessage = message => {
    const { data } = message;
    if (!data || !data.__RESET_REACT_DEVTOOLS_PORT__) return;

    const port = Number(data.__RESET_REACT_DEVTOOLS_PORT__);
    const platform = data.platform;
    if (port && port !== this.listeningPort) {
      this.closeServerIfExists();
      this.server = this.startServer(port);
      if (platform === 'android') tryADBReverse(port).catch(() => {});
    }
  };

  startServer(port = window.reactDevToolsPort) {
    this.listeningPort = port;
    return ReactServer.setContentDOMNode(document.getElementById(containerId)).startServer(port);
  }

  closeServerIfExists = () => {
    if (this.server) {
      this.server.close();
      this.server = null;
      this.listeningPort = null;
    }
  };

  render() {
    return (
      <div id={containerId} style={styles.container}>
        <div id="waiting"><h2>Waiting for React to connect…</h2></div>
      </div>
    );
  }
}
