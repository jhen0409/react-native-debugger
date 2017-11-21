import { ipcRenderer, remote } from 'electron';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as debuggerActions from '../actions/debugger';
import * as settingActions from '../actions/setting';
import ReduxDevTools from './ReduxDevTools';
import ReactInspector from './ReactInspector';
import FormInput from '../components/FormInput';
import Draggable from '../components/Draggable';
import { catchConsoleLogLink } from '../../electron/devtools';

const currentWindow = remote.getCurrentWindow();

const styles = {
  container: {
    height: '100%',
  },
  wrapBackground: {
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
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
    debugger: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  };

  componentDidMount() {
    const { toggleDevTools } = this.props.actions.setting;
    ipcRenderer.on('toggle-devtools', (e, name) => toggleDevTools(name));
    ipcRenderer.on('sync-state', (event, arg) => this.props.actions.debugger.syncState(arg));
    ipcRenderer.on('set-debugger-loc', (e, payload) => {
      const location = JSON.parse(payload);
      this.setDebuggerLocation(location);
      catchConsoleLogLink(currentWindow, location.host || 'localhost', location.port);
    });
    if (!this.props.debugger.isPortSettingRequired) {
      this.setDebuggerLocation(JSON.parse(process.env.DEBUGGER_SETTING || '{}'));
    }
    window.onbeforeunload = this.removeAllListeners;
    window.notifyDevToolsThemeChange = this.props.actions.setting.changeDefaultTheme;
  }

  componentWillUnmount() {
    this.removeAllListeners();
    window.notifyDevToolsThemeChange = null;
  }

  onResize = (x, y) => this.props.actions.setting.resizeDevTools(y / window.innerHeight);

  setDebuggerLocation({ projectRoots, ...location }) {
    this.props.actions.debugger.setDebuggerLocation(location);
    if (projectRoots) {
      ReactInspector.setProjectRoots(projectRoots);
    }
  }

  getReactBackgroundColor = () => {
    const { themeName } = this.props.setting;
    switch (themeName) {
      case 'dark':
        return '#242424';
      case 'default':
        return 'white';
      default:
        return 'transparent';
    }
  };

  getLayoutStyle = size => ({
    width: '100%',
    height: `${size * 100}%`,
    display: size ? 'inline-block' : 'none',
    backgroundColor: this.getReactBackgroundColor(),
  });

  getDevToolsSize() {
    const { redux, react, size } = this.props.setting;
    if (!redux || !react) {
      return {
        redux: redux ? 1 : 0,
        react: react ? 1 : 0,
      };
    }
    return { redux: size, react: 1 - size };
  }

  removeAllListeners() {
    ipcRenderer.removeAllListeners('toggle-devtools');
    ipcRenderer.removeAllListeners('set-debugger-loc');
    ipcRenderer.removeAllListeners('sync-state');
  }

  background = (
    <div style={styles.wrapBackground}>
      <div style={styles.text}>
        <kbd style={styles.shortcut}>{`${shortcutPrefix}K`}</kbd>
        {' to toggle Redux DevTools'}
      </div>
      <div style={styles.text}>
        <kbd style={styles.shortcut}>{`${shortcutPrefix}J`}</kbd>
        {' to toggle React DevTools'}
      </div>
    </div>
  );

  handlePortOnSubmit = (evt, port) => {
    ipcRenderer.once('check-port-available-reply', (event, available) => {
      if (!available) {
        alert(`The port ${port} is already used by another window.`);
        return;
      }
      const { setDebuggerLocation } = this.props.actions.debugger;
      setDebuggerLocation({
        ...JSON.parse(process.env.DEBUGGER_SETTING || '{}'),
        port,
      });
      currentWindow.openDevTools();
    });
    ipcRenderer.send('check-port-available', port);
  };

  renderPortSetting() {
    return (
      <div style={styles.wrapBackground}>
        <FormInput
          title={'Type an another React Native packager port'}
          button="Confirm"
          inputProps={{
            type: 'input',
            value: 19001,
          }}
          onInputChange={value => Number(value.replace(/\D/g, '').substr(0, 5)) || ''}
          onSubmit={this.handlePortOnSubmit}
        />
      </div>
    );
  }

  renderReduxDevTools(size) {
    return (
      <div style={this.getLayoutStyle(size)}>
        <ReduxDevTools />
        <Draggable onMove={this.onResize} />
      </div>
    );
  }

  renderReactInspector(size) {
    return (
      <div style={this.getLayoutStyle(size)}>
        <ReactInspector />
      </div>
    );
  }

  render() {
    const { isPortSettingRequired } = this.props.debugger;
    if (isPortSettingRequired) {
      return this.renderPortSetting();
    }
    const { redux, react } = this.getDevToolsSize();
    return (
      <div style={styles.container}>
        {this.renderReduxDevTools(redux)}
        {this.renderReactInspector(react)}
        {!react && !redux && this.background}
      </div>
    );
  }
}
