import { getCurrentWindow } from '@electron/remote'
import React from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { createRoot } from 'react-dom/client'
import App from './containers/App'
import configureStore from './store/configureStore'
import { beforeWindowClose } from './actions/debugger'
import { client, tryADBReverse } from '../utils/adb'
import { toggleOpenInEditor } from '../utils/devtools'
import { GlobalStyle } from '../globalStyles'

const currentWindow = getCurrentWindow()

export const startLegacyDebugger = () => {
  let store
  let persistor
  const handleReady = () => {
    const root = createRoot(document.getElementById('root'))
    root.render(
      <>
        <GlobalStyle />
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <App />
          </PersistGate>
        </Provider>
      </>,
    )
  }

  ;({ store, persistor } = configureStore(handleReady))

  // Provide for user
  window.adb = client
  window.adb.reverseAll = tryADBReverse
  window.adb.reversePackager = () =>
    tryADBReverse(store.getState().debugger.location.port)

  window.checkWindowInfo = () => {
    const debuggerState = store.getState().debugger
    return {
      isWorkerRunning: !!debuggerState.worker,
      location: debuggerState.location,
      isPortSettingRequired: debuggerState.isPortSettingRequired,
    }
  }

  window.beforeWindowClose = () =>
    new Promise((resolve) => {
      if (store.dispatch(beforeWindowClose())) {
        setTimeout(resolve, 200)
      } else {
        resolve()
      }
    })

  window.toggleOpenInEditor = () => {
    const { port } = store.getState().debugger.location
    return toggleOpenInEditor(currentWindow, port)
  }
}
