import { ipcRenderer } from 'electron';
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Dock from 'react-dock';
import * as debuggerActions from '../actions/debugger';
import * as settingActions from '../actions/setting';
import ReduxDevTools from './ReduxDevTools';
import ReactInspector from './ReactInspector';

const styles = {
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

const shortcutPrefix = process.platform === 'darwin' ? '⌥⌘' : 'Ctrl+Alt+';

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
    const { toggleDevTools } = this.props.actions.setting;
    ipcRenderer.on('toggle-devtools', (e, name) => {
      toggleDevTools(name);
    });

    const { setDebuggerLocation } = this.props.actions.debugger;
    ipcRenderer.on('set-debugger-loc', (e, payload) => {
      setDebuggerLocation(JSON.parse(payload));
    });
    setDebuggerLocation(JSON.parse(process.env.DEBUGGER_SETTING || '{}'));

    window.onbeforeunload = this.removeAllListeners;
  }

  componentWillUnmount() {
    this.removeAllListeners();
  }

  onReduxDockResize = size => {
    const { setting } = this.props.actions;
    setting.resizeDevTools(size);
  };

  removeAllListeners() {
    ipcRenderer.removeAllListeners('toggle-devtools');
    ipcRenderer.removeAllListeners('set-debugger-loc');
  }

  background =
    <div style={styles.wrapBackground}>
      <div style={styles.text}>
        <kbd style={styles.shortcut}>{`${shortcutPrefix}K`}</kbd>
        {' to toggle Redux DevTools'}
      </div>
      <div style={styles.text}>
        <kbd style={styles.shortcut}>{`${shortcutPrefix}J`}</kbd>
        {' to toggle React DevTools'}
      </div>
    </div>;

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
        onSizeChange={this.onReduxDockResize}
      >
        <ReduxDevTools />
      </Dock>
    );
  }

  renderReactInspector() {
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
        <ReactInspector />
      </div>
    );
  }

  render() {
    const { redux, react } = this.props.setting;
    return (
      <div>
        {this.renderReduxDevTools()}
        {this.renderReactInspector()}
        {!react && !redux && this.background}
      </div>
    );
  }
}
