let enabled = false;
export const toggleOpenInEditor = win => {
  if (win.devToolsWebContents) {
    enabled = !enabled;
    win.devToolsWebContents.executeJavaScript(`
      window.__IS_OPEN_IN_EDITOR_ENABLED__ = ${enabled};
    `);
  }
};

export const isOpenInEditorEnabled = () => enabled;
