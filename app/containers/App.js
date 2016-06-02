import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as debuggerActions from '../actions/debugger';

import Debugger from './Debugger';
import ReduxDevTools from './ReduxDevTools';
import ReactDevTools from './ReactDevTools';

import { ipcRenderer } from 'electron';

const styles = {
  container: {
    width: '100%',
    heigth: '100%',
  },
  wrapReduxPanel: {
    position: 'fixed',
    display: 'flex',
    width: '100%',
    height: '60%',
  },
  reduxPanel: {
    display: 'flex',
    width: '100%',
    height: '100%',
  },
  wrapReactPanel: {
    display: 'flex',
    position: 'fixed',
    width: '100%',
    height: '40%',
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
    '-webkit-user-select': 'none',
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
  }
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
  };

  componentDidMount() {
    ipcRenderer.on('toggle-devtools', (e, name) => {
      this.setState({ [name]: !this.state[name] });
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('toggle-devtools');
  }

  renderReduxDevTools() {
    const wrapStyle = {
      ...styles.wrapReduxPanel,
      ...(this.state.react ? {} : { height: '100%' }),
      ...(this.state.redux ? {} : { display: 'none' }),
    };
    return (
      <div style={wrapStyle}>
        <ReduxDevTools style={styles.reduxPanel} />
      </div>
    );
  }

  renderReactDevTools() {
    const wrapStyle = {
      ...styles.wrapReactPanel,
      ...(this.state.redux ? {} : { height: '100%' }),
      ...(this.state.react ? {} : { display: 'none' }),
    };
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
          <span style={styles.shortcut}>⌥⌘K</span> to toggle Redux DevTools
        </div>
        <div style={styles.text}>
          <span style={styles.shortcut}>⌥⌘J</span> to toggle React DevTools
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
