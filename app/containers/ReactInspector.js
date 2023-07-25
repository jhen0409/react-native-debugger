import { connect } from 'react-redux'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { tryADBReverse } from '../utils/adb'

let ReactServer
const getReactInspector = () => {
  if (ReactServer) return ReactServer
  // eslint-disable-next-line
  ReactServer = ReactServer || require('react-devtools-core/standalone').default;

  return ReactServer
}
const containerId = 'react-devtools-container'

const styles = {
  container: {
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
    position: 'relative',
  },
  waiting: {
    height: '100%',
    display: 'flex',
    WebkitUserSelect: 'none',
    textAlign: 'center',
    color: '#aaa',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
}

const isReactPanelOpen = (props) => props.settingState.react

class ReactInspector extends Component {
  static setProjectRoots(projectRoots) {
    getReactInspector().setProjectRoots(projectRoots)
  }

  listeningPort = window.reactDevToolsPort

  componentDidMount() {
    const { debuggerState } = this.props
    const { worker } = debuggerState
    if (worker) {
      this.server = this.startServer()
      worker.addEventListener('message', this.workerOnMessage)
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { debuggerState } = this.props
    const { worker } = debuggerState
    const { worker: nextWorker } = nextProps.debuggerState
    if (nextWorker && nextWorker !== worker) {
      this.closeServerIfExists()
      if (isReactPanelOpen(this.props)) {
        this.server = this.startServer()
      }
      nextWorker.addEventListener('message', this.workerOnMessage)
    } else if (!nextWorker) {
      this.closeServerIfExists()
    }
    // Open / Close server when react panel opened / hidden
    if (!worker && !nextWorker) return
    if (isReactPanelOpen(this.props) && !isReactPanelOpen(nextProps)) {
      this.closeServerIfExists()
    } else if (!isReactPanelOpen(this.props) && isReactPanelOpen(nextProps)) {
      this.closeServerIfExists()
      this.server = this.startServer()
    }
  }

  shouldComponentUpdate() {
    return false
  }

  componentWillUnmount() {
    this.closeServerIfExists()
  }

  workerOnMessage = (message) => {
    const { data } = message
    if (!data || !data.__REPORT_REACT_DEVTOOLS_PORT__) return

    const port = Number(data.__REPORT_REACT_DEVTOOLS_PORT__)
    const { platform } = data
    if (port && port !== this.listeningPort) {
      this.listeningPort = port
      this.closeServerIfExists()
      if (isReactPanelOpen(this.props)) {
        this.server = this.startServer(port)
      }
      if (platform === 'android') tryADBReverse(port).catch(() => {})
    }
  }

  closeServerIfExists = () => {
    if (this.server) {
      this.server.close()
      this.server = null
    }
  }

  startServer(port = this.listeningPort) {
    let loggedWarn = false

    return getReactInspector()
      .setStatusListener((status) => {
        if (!loggedWarn && status === 'Failed to start the server.') {
          const message = port !== 8097
            ? 're-open the debugger window might be helpful.'
            : 'we recommended to upgrade React Native version to 0.39+ for random port support.'
          console.error(
            '[RNDebugger]',
            `Failed to start React DevTools server with port \`${port}\`,`,
            'because another server is listening,',
            message,
          )
          loggedWarn = true
        }
      })
      .setContentDOMNode(document.getElementById(containerId))
      .startServer(port)
  }

  render() {
    return (
      <div id={containerId} style={styles.container}>
        <div id="waiting" style={styles.waiting}>
          <h2>Waiting for React to connect…</h2>
        </div>
      </div>
    )
  }
}

ReactInspector.propTypes = {
  debuggerState: PropTypes.shape({
    worker: PropTypes.shape({
      addEventListener: PropTypes.func.isRequired,
    }),
  }).isRequired,
}

export default connect(
  (state) => ({
    settingState: state.setting,
    debuggerState: state.debugger,
  }),
  (dispatch) => ({ dispatch }),
)(ReactInspector)
