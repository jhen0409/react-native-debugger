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

// It's works only if Network tab have been opened,
// otherwise it can't found `UI.panels.network`
export const clearNetworkLogs = win => {
  if (win.devToolsWebContents) {
    return win.devToolsWebContents.executeJavaScript(`(() => {
      const { network } = UI.panels;
      if (network && network._clearButton && network._clearButton._clicked) {
        network._clearButton._clicked({ consume: f => f });
      }
    })()`);
  }
};

// NOTE: Need to update when Chromium version upgraded:
// https://github.com/ChromeDevTools/devtools-frontend/commit/12286a5ac01fe54f3363edfec8ad613c18293fd1
//   _selectElement.options -> _list._items
//   _executionContextChanged -> _updateSelectedContext
export const selectRNDebuggerWorkerContext = win => {
  if (win.devToolsWebContents) {
    return win.devToolsWebContents.executeJavaScript(`(() => {
      const { console } = UI.panels;
      if (console && console._view && console._view._consoleContextSelector) {
        const selector = console._view._consoleContextSelector;
        selector._select(selector._selectElement.options[1]);
        selector._executionContextChanged();
      }
    })()`);
  }
};
