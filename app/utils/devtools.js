import { getCatchConsoleLogScript } from '../../electron/devtools';

let enabled = false;
export const toggleOpenInEditor = (win, host, port) => {
  if (win.devToolsWebContents) {
    enabled = !enabled;
    return win.devToolsWebContents.executeJavaScript(`(() => {
      ${getCatchConsoleLogScript(host, port)}
      window.__IS_OPEN_IN_EDITOR_ENABLED__ = ${enabled};
    })()`);
  }
};

export const isOpenInEditorEnabled = () => enabled;

export const clearNetworkLogs = win => {
  if (win.devToolsWebContents) {
    return win.devToolsWebContents.executeJavaScript(`(() => {
      if (typeof SDK === 'object' && SDK.networkLog) {
        SDK.networkLog.reset()
      }
    })()`);
  }
};

export const selectRNDebuggerWorkerContext = win => {
  if (win.devToolsWebContents) {
    return win.devToolsWebContents.executeJavaScript(`setTimeout(() => {
      const { console } = UI.panels;
      if (console && console._view && console._view._consoleContextSelector) {
        const selector = console._view._consoleContextSelector;
        const item = selector._items._items.find(
          item => item._label === 'RNDebuggerWorker.js'
        );
        if (item) {
          selector.itemSelected(item);
        }
      }
    }, 100)`);
  }
};
