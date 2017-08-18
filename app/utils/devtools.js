import { getCatchConsoleLogScript } from '../../electron/devtools';

let enabled = false;
export const toggleOpenInEditor = (win, host, port) => {
  if (win.devToolsWebContents) {
    enabled = !enabled;
    win.devToolsWebContents.executeJavaScript(`(() => {
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
