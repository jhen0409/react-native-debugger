export const getCatchConsoleLogScript = (port) => `
  window.__RN_PACKAGER_MATCHER__ = /^http:\\/\\/[^:]+:${port}/;
  if (!window.__INJECT_OPEN_IN_EDITOR_SCRIPT__) {
    const rndHelperQuery = 'iframe[data-devtools-extension="RNDebugger devtools helper"]';
    document.addEventListener('click', event => {
      if (!window.__IS_OPEN_IN_EDITOR_ENABLED__) {
        return;
      }
      const { target } = event;
      if (target.className === 'devtools-link') {
        const source = target.title;
        if (source && source.match(window.__RN_PACKAGER_MATCHER__)) {
          const rndHelper = document.querySelector(rndHelperQuery);
          if (rndHelper && rndHelper.contentWindow) {
            rndHelper.contentWindow.postMessage(
              {
                type: 'open-in-editor',
                source: source.replace(window.__RN_PACKAGER_MATCHER__, '')
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
`

export const catchConsoleLogLink = (win, host = 'localhost', port = 8081) => {
  if (win.devToolsWebContents) {
    return win.devToolsWebContents.executeJavaScript(`(() => {
      ${getCatchConsoleLogScript(host, port)}
    })()`)
  }
}

export const removeUnecessaryTabs = (win) => {
  if (
    process.env.NODE_ENV === 'production'
    && !process.env.DEBUG_RNDEBUGGER
    && win.devToolsWebContents
  ) {
    return win.devToolsWebContents.executeJavaScript(`(() => {
      const tabbedPane = UI.inspectorView.tabbedPane;
      if (tabbedPane) {
        tabbedPane.closeTab('elements');
        tabbedPane.closeTab('security');
        tabbedPane.closeTab('audits');
        tabbedPane.closeTab('audits2');
        tabbedPane.closeTab('lighthouse');

        tabbedPane.leftToolbar().element.remove();
      }
    })()`)
  }
}

export const activeTabs = (win) => {
  if (win.devToolsWebContents) {
    // Active network tab so we can do clearNetworkLogs
    return win.devToolsWebContents.executeJavaScript(`(() => {
      DevToolsAPI.showPanel('network');
      DevToolsAPI.showPanel('console');
    })()`)
  }
}
