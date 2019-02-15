export const getCatchConsoleLogScript = (host, port) => `
  window.__RN_PACKAGER_PREFIX__ = 'http://${host}:${port}';
  if (!window.__INJECT_OPEN_IN_EDITOR_SCRIPT__) {
    const rndHelperQuery = "iframe[src*='chrome-extension://rndebugger-devtools-helper/main.html']";
    document.addEventListener('click', event => {
      if (!window.__IS_OPEN_IN_EDITOR_ENABLED__) {
        return;
      }
      const { target } = event;
      if (target.className === 'devtools-link') {
        const source = target.title;
        if (source && source.startsWith(window.__RN_PACKAGER_PREFIX__)) {
          const rndHelper = document.querySelector(rndHelperQuery);
          if (rndHelper && rndHelper.contentWindow) {
            rndHelper.contentWindow.postMessage(
              {
                type: 'open-in-editor',
                source: source.replace(window.__RN_PACKAGER_PREFIX__, ''),
              },
              '*'
            );
            return event.stopPropagation();
          }
        }
      }
    }, true);
    window.__INJECT_OPEN_IN_EDITOR_SCRIPT__ = true;
  }
`;

export const catchConsoleLogLink = (win, host = 'localhost', port = 8081) => {
  if (win.devToolsWebContents) {
    return win.devToolsWebContents.executeJavaScript(`(() => {
      ${getCatchConsoleLogScript(host, port)}
    })()`);
  }
};

export const removeUnecessaryTabs = win => {
  if (
    process.env.NODE_ENV === 'production' &&
    !process.env.DEBUG_RNDEBUGGER &&
    win.devToolsWebContents
  ) {
    return win.devToolsWebContents.executeJavaScript(`(() => {
      const tabbedPane = UI.inspectorView._tabbedPane;
      if (tabbedPane) {
        tabbedPane.closeTab('elements');
        tabbedPane.closeTab('security');
        tabbedPane.closeTab('audits');

        tabbedPane._leftToolbar._contentElement.remove();
      }
    })()`);
  }
};
