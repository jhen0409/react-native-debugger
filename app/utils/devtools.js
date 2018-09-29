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
      if (typeof NetworkLog === 'object') {
        NetworkLog.networkLog.reset()
      }
      if (typeof BrowserSDK === 'object') {
        BrowserSDK.networkLog.reset()
      }
    })()`);
  }
};

export const selectRNDebuggerWorkerContext = win => {
  if (win.devToolsWebContents) {
    return win.devToolsWebContents.executeJavaScript(`(() => {
      const { console } = UI.panels;
      if (console && console._view && console._view._consoleContextSelector) {
        const selector = console._view._consoleContextSelector;
        selector.itemSelected(selector._items._items[1]);
      }
    })()`);
  }
};
