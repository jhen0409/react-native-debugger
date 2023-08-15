// import { getCurrentWindow } from '@electron/remote'
import React from 'react'
// import { Provider } from 'react-redux'
// import { PersistGate } from 'redux-persist/integration/react'
import { createRoot } from 'react-dom/client'
import App from './containers/App'
import { client, tryADBReverse } from './utils/adb'
// import { toggleOpenInEditor } from './utils/devtools'
import { GlobalStyle } from './globalStyles'

// const currentWindow = getCurrentWindow()

export const startDebugger = () => {
  let store
  let persistor
  const handleReady = () => {
    const root = createRoot(document.getElementById('root'))
    root.render(
      <>
        <GlobalStyle />
        <App />
      </>,
    )
  }

  // ;({ store, persistor } = configureStore(handleReady))
  handleReady()

  // Provide for user
  window.adb = client
  window.adb.reverseAll = tryADBReverse
  window.adb.reversePackager = () => {
    // tryADBReverse(store.getState().debugger.location.port)
  }

  window.checkWindowInfo = () => {
    // const debuggerState = store.getState().debugger
    // return {
    //   isWorkerRunning: !!debuggerState.worker,
    //   location: debuggerState.location,
    //   isPortSettingRequired: debuggerState.isPortSettingRequired,
    // }
  }

  window.beforeWindowClose = () => {}

  window.toggleOpenInEditor = () => {
    // const { port } = store.getState().debugger.location
    // return toggleOpenInEditor(currentWindow, port)
  }
}
