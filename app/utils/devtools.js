import { getCatchConsoleLogScript } from '../../electron/devtools';

let enabled = false;
export const toggleOpenInEditor = (win, host, port) => {
  if (win.devToolsWebContents) {
    enabled = !enabled;
    win.devToolsWebContents.executeJavaScript(`
      ${getCatchConsoleLogScript(host, port)}
      window.__IS_OPEN_IN_EDITOR_ENABLED__ = ${enabled};
    `);
  }
};

export const isOpenInEditorEnabled = () => enabled;
