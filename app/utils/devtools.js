import { getCatchConsoleLogScript } from '../../electron/devtools'

let enabled = false
export const toggleOpenInEditor = (win, port) => {
  if (win.devToolsWebContents) {
    enabled = !enabled
    return win.devToolsWebContents.executeJavaScript(`(() => {
      ${getCatchConsoleLogScript(port)}
      window.__IS_OPEN_IN_EDITOR_ENABLED__ = ${enabled};
    })()`)
  }
}

export const isOpenInEditorEnabled = () => enabled

export const clearNetworkLogs = (win) => {
  if (win.devToolsWebContents) {
    return win.devToolsWebContents.executeJavaScript(`setTimeout(() => {
      const { network } = UI.panels;
      if (network && network.networkLogView && network.networkLogView.reset) {
        network.networkLogView.reset()
      }
    }, 100)`)
  }
}

export const selectRNDebuggerWorkerContext = (win) => {
  if (win.devToolsWebContents) {
    return win.devToolsWebContents.executeJavaScript(`setTimeout(() => {
      const { console } = UI.panels;
      if (console && console.view && console.view.consoleContextSelector) {
        const selector = console.view.consoleContextSelector;
        const item = selector.items.items.find(
          item => item.label() === 'RNDebuggerWorker.js'
        );
        if (item) {
          selector.itemSelected(item);
        }
      }
    }, 100)`)
  }
}
