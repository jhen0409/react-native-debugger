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

export const catchConsoleLogLink = (win, host = 'localhost', port = 8081) => {
  if (win.devToolsWebContents) {
    return win.devToolsWebContents.executeJavaScript(`(() => {
      ${getCatchConsoleLogScript(host, port)}
    })()`)
  }
}

export const removeUnecessaryTabs = (win) => {
  if (win.devToolsWebContents
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
    })()`).then(resExec=> console.log(resExec))
      .catch(errExec=> console.log('ERROR', errExec));
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