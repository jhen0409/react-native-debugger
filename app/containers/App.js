import { ipcRenderer } from 'electron'
import { getCurrentWindow } from '@electron/remote'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as debuggerActionCreators from '../actions/debugger'
import * as settingActionCreators from '../actions/setting'
import ReduxDevTools from './redux/DevTools'
import ReactInspector from './ReactInspector'
import FormInput from '../components/FormInput'
import Draggable from '../components/Draggable'
import { catchConsoleLogLink } from '../../electron/devtools'

const currentWindow = getCurrentWindow()

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
}

const shortcutPrefix = process.platform === 'darwin' ? '⌥⌘' : 'Ctrl+Alt+'

const background = (
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
)

const removeAllIPCListeners = () => {
  ipcRenderer.removeAllListeners('toggle-devtools')
  ipcRenderer.removeAllListeners('set-debugger-loc')
  ipcRenderer.removeAllListeners('sync-state')
}

class App extends Component {
  componentDidMount() {
    const { settingActions, debuggerActions } = this.props
    ipcRenderer.on('toggle-devtools', (e, name) => settingActions.toggleDevTools(name))
    ipcRenderer.on('sync-state', (event, arg) => debuggerActions.syncState(arg))
    ipcRenderer.on('set-debugger-loc', (e, payload) => {
      const location = JSON.parse(payload)
      this.setDebuggerLocation(location)
      catchConsoleLogLink(currentWindow, location.host || 'localhost', location.port)
    })
    const { debuggerState } = this.props
    if (!debuggerState.isPortSettingRequired) {
      this.setDebuggerLocation(JSON.parse(process.env.DEBUGGER_SETTING || '{}'))
    }
    window.onbeforeunload = removeAllIPCListeners
    window.notifyDevToolsThemeChange = settingActions.changeDefaultTheme
  }

  componentWillUnmount() {
    removeAllIPCListeners()
    window.notifyDevToolsThemeChange = null
  }

  onResize = (x, y) => {
    const { settingActions } = this.props
    settingActions.resizeDevTools(y / window.innerHeight)
  }

  setDebuggerLocation({ projectRoots, ...location }) {
    const { debuggerActions } = this.props
    debuggerActions.setDebuggerLocation(location)
    if (projectRoots) {
      ReactInspector.setProjectRoots(projectRoots)
    }
  }

  getReactBackgroundColor = () => {
    const { settingState } = this.props
    const { themeName } = settingState
    switch (themeName) {
      case 'dark':
        return '#242424'
      case 'default':
        return 'white'
      default:
        return 'transparent'
    }
  }

  getLayoutStyle = (size) => ({
    width: '100%',
    height: `${size * 100}%`,
    display: size ? 'inline-block' : 'none',
    backgroundColor: this.getReactBackgroundColor(),
  })

  getDevToolsSize() {
    const { settingState } = this.props
    const { redux, react, size } = settingState
    if (!redux || !react) {
      return {
        redux: redux ? 1 : 0,
        react: react ? 1 : 0,
      }
    }
    return { redux: size, react: 1 - size }
  }

  handlePortOnSubmit = (evt, port) => {
    ipcRenderer.once('check-port-available-reply', (event, available) => {
      if (!available) {
        window.alert(`The port ${port} is already used by another window.`)
        return
      }
      const { debuggerActions } = this.props
      debuggerActions.setDebuggerLocation({
        ...JSON.parse(process.env.DEBUGGER_SETTING || '{}'),
        port,
      })
      currentWindow.openDevTools()
    })
    ipcRenderer.send('check-port-available', port)
  }

  renderPortSetting() {
    return (
      <div style={styles.wrapBackground}>
        <FormInput
          title="Type in another React Native packager port"
          button="Confirm"
          inputProps={{
            type: 'input',
            value: 19000,
          }}
          onInputChange={(value) => Number(value.replace(/\D/g, '').substr(0, 5)) || ''}
          onSubmit={this.handlePortOnSubmit}
        />
      </div>
    )
  }

  renderReduxDevTools(size) {
    return (
      <div style={this.getLayoutStyle(size)}>
        <ReduxDevTools />
        <Draggable onMove={this.onResize} />
      </div>
    )
  }

  renderReactInspector(size) {
    return (
      <div style={this.getLayoutStyle(size)}>
        <ReactInspector />
      </div>
    )
  }

  render() {
    const { debuggerState } = this.props
    const { isPortSettingRequired } = debuggerState
    if (isPortSettingRequired) {
      return this.renderPortSetting()
    }
    const { redux, react } = this.getDevToolsSize()
    return (
      <div style={styles.container}>
        {this.renderReduxDevTools(redux)}
        {this.renderReactInspector(react)}
        {!react && !redux && background}
      </div>
    )
  }
}

App.propTypes = {
  settingState: PropTypes.shape({
    redux: PropTypes.bool.isRequired,
    react: PropTypes.bool.isRequired,
    size: PropTypes.number.isRequired,
    themeName: PropTypes.string.isRequired,
  }).isRequired,
  settingActions: PropTypes.shape({
    toggleDevTools: PropTypes.func.isRequired,
    resizeDevTools: PropTypes.func.isRequired,
    changeDefaultTheme: PropTypes.func.isRequired,
  }).isRequired,
  debuggerState: PropTypes.shape({
    isPortSettingRequired: PropTypes.bool.isRequired,
  }).isRequired,
  debuggerActions: PropTypes.shape({
    setDebuggerLocation: PropTypes.func.isRequired,
    syncState: PropTypes.func.isRequired,
  }).isRequired,
}

export default connect(
  (state) => ({
    debuggerState: state.debugger,
    settingState: state.setting,
  }),
  (dispatch) => ({
    debuggerActions: bindActionCreators(debuggerActionCreators, dispatch),
    settingActions: bindActionCreators(settingActionCreators, dispatch),
  }),
)(App)
