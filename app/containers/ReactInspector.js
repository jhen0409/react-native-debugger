/* eslint import/no-extraneous-dependencies: 0 import/no-unresolved: 0 */

import { connect } from 'react-redux';
import React, { Component, PropTypes } from 'react';
import ReactServer from 'react-devtools-core/standalone';

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
  dispatch => ({ dispatch }),
)
export default class ReactInspector extends Component {
  static propTypes = {
    debugger: PropTypes.object,
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

  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount() {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }

  startServer(port = 8097) {
    return ReactServer
      .setContentDOMNode(document.getElementById(containerId))
      .startServer(port);
  }

  render() {
    return (
      <div
        id={containerId}
        style={styles.container}
      >
        <div id="waiting"><h2>Waiting for React to connect…</h2></div>
      </div>
    );
  }
}
