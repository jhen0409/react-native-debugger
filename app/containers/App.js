import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Dock from 'react-dock';
import * as debuggerActions from '../actions/debugger';
import Debugger from './Debugger';
import ReduxDevTools from './ReduxDevTools';
import ReactDevTools from './ReactDevTools';

const styles = {
  container: {
    width: '100%',
    heigth: '100%',
  },
  reduxPanel: {
    display: 'flex',
    width: '100%',
    height: '100%',
  },
  wrapReactPanel: {
    display: 'flex',
    position: 'fixed',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
    left: 0,
    bottom: 0,
    backgroundColor: 'white',
  },
  wrapBackground: {
    display: 'flex',
    position: 'fixed',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    color: '#ccc',
    fontSize: '25px',
    WebkitUserSelect: 'none',
  },
  text: {
    textAlign: 'center',
    margin: '7px',
  },
  shortcut: {
    fontFamily: 'Monaco, monospace',
    color: '#ddd',
    backgroundColor: '#555',
    padding: '4px',
    borderRadius: '4px',
    letterSpacing: '3px',
  },
};

@connect(
  state => ({
    debugger: state.debugger,
  }),
  dispatch => bindActionCreators(debuggerActions, dispatch)
)
export default class App extends Component {
  state = {
    react: true,
    redux: true,
    size: 0.6,
  };

  componentDidMount() {
    ipcRenderer.on('toggle-devtools', (e, name) => {
      this.setState({ [name]: !this.state[name] });
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('toggle-devtools');
  }

  onReudxDockResize = size => {
    if (!this.state.redux || !this.state.react) return;
    if (size < 0.2) return this.setState({ size: 0.2 });
    if (size > 0.8) return this.setState({ size: 0.8 });
    this.setState({ size });
  };

  renderReduxDevTools() {
    let size = this.state.size;
    if (!this.state.redux) {
      size = 0;
    } else if (!this.state.react) {
      size = 1;
    }
    return (
      <Dock
        isVisible
        zIndex={500}
        position="top"
        size={size}
        dimMode="none"
        onSizeChange={this.onReudxDockResize}
      >
        <ReduxDevTools style={styles.reduxPanel} />
      </Dock>
    );
  }

  renderReactDevTools() {
    const wrapStyle = Object.assign({}, styles.wrapReactPanel);
    if (!this.state.react) {
      wrapStyle.display = 'none';
    } else {
      wrapStyle.height = this.state.redux ?
        `${(1 - this.state.size) * 100}%` :
        '100%';
    }
    return (
      <div style={wrapStyle}>
        <ReactDevTools />
      </div>
    );
  }

  renderBackground() {
    return (
      <div style={styles.wrapBackground}>
        <div style={styles.text}>
          <kbd style={styles.shortcut}>⌥⌘K</kbd> to toggle Redux DevTools
        </div>
        <div style={styles.text}>
          <kbd style={styles.shortcut}>⌥⌘J</kbd> to toggle React DevTools
        </div>
      </div>
    );
  }

  render() {
    return (
      <div style={styles.container}>
        <Debugger />
        {this.renderReduxDevTools()}
        {this.renderReactDevTools()}
        {!this.state.react && !this.state.redux && this.renderBackground()}
      </div>
    );
  }
}
