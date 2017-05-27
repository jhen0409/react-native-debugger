import { ipcRenderer, remote } from 'electron';
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Dock from 'react-dock';
import * as debuggerActions from '../actions/debugger';
import * as settingActions from '../actions/setting';
import ReduxDevTools from './ReduxDevTools';
import ReactInspector from './ReactInspector';
import FormInput from '../components/FormInput';

const currentWindow = remote.getCurrentWindow();

const styles = {
  wrapReactPanel: {
    display: 'flex',
    position: 'fixed',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
    left: 0,
    bottom: 0,
  },
  wrapBackground: {
    display: 'flex',
    position: 'fixed',
    width: '100%',
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
  link: {
    textAlign: 'center',
    margin: '7px',
    fontSize: '12px',
    cursor: 'pointer',
    color: '#aaa',
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
    ipcRenderer.on('toggle-devtools', (e, name) => {
      toggleDevTools(name);
    });

    const { setDebuggerLocation } = this.props.actions.debugger;
    ipcRenderer.on('set-debugger-loc', (e, payload) => {
      setDebuggerLocation(JSON.parse(payload));
    });
    if (!this.props.debugger.isPortSettingRequired) {
      setDebuggerLocation(JSON.parse(process.env.DEBUGGER_SETTING || '{}'));
    }
    window.onbeforeunload = this.removeAllListeners;
    window.notifyDevToolsThemeChange = this.props.actions.setting.changeDefaultTheme;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.setting.themeName !== nextProps.setting.themeName) {
      ReactInspector.setDefaultThemeName(nextProps.setting.themeName);
    }
  }

  componentWillUnmount() {
    this.removeAllListeners();
    window.notifyDevToolsThemeChange = null;
  }

  onReduxDockResize = size => {
    const { setting } = this.props.actions;
    setting.resizeDevTools(size);
  };

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
  renderReactInspector(size) {
    const wrapStyle = {
      ...styles.wrapReactPanel,
      height: `${size * 100}%`,
      display: size ? 'inline' : 'none',
      backgroundColor: this.getReactBackgroundColor(),
    };
    return (
      <div style={wrapStyle}>
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
      <div>
        {this.renderReduxDevTools(redux)}
        {this.renderReactInspector(react)}
        {!react && !redux && this.background}
      </div>
    );
  }
}
