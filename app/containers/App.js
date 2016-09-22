import { ipcRenderer } from 'electron';
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Dock from 'react-dock';
import * as debuggerActions from '../actions/debugger';
import * as settingActions from '../actions/setting';
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
    setting: state.setting,
  }),
  dispatch => ({
    actions: {
      debugger: bindActionCreators(debuggerActions, dispatch),
      setting: bindActionCreators(settingActions, dispatch),
    },
  })
)
export default class App extends Component {
  static propTypes = {
    setting: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  };

  componentDidMount() {
    ipcRenderer.on('toggle-devtools', (e, name) => {
      const { setting } = this.props.actions;
      setting.toggleDevTools(name);
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('toggle-devtools');
  }

  onReudxDockResize = size => {
    const { setting } = this.props.actions;
    setting.resizeDevTools(size);
  };

  renderReduxDevTools() {
    const { redux, react } = this.props.setting;
    let { size } = this.props.setting;
    if (!redux) {
      size = 0;
    } else if (!react) {
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
    const { redux, react, size } = this.props.setting;
    if (!react) {
      wrapStyle.display = 'none';
    } else {
      wrapStyle.height = redux ?
        `${(1 - size) * 100}%` :
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
    const { redux, react } = this.props.setting;
    return (
      <div style={styles.container}>
        <Debugger />
        {this.renderReduxDevTools()}
        {this.renderReactDevTools()}
        {!react && !redux && this.renderBackground()}
      </div>
    );
  }
}
