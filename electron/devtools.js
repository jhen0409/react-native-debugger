export const catchConsoleLogLink = (win, host = 'localhost', port = 8081) => {
  const injectScript = `
    window.__RN_PACKAGER_PREFIX__ = 'http://${host}:${port}';
    const rndHelperQuery = "iframe[src*='chrome-extension://rndebugger-devtools-helper/main.html']";
    if (!window.__INJECT_OPEN_IN_EDITOR_SCRIPT__) {
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
  if (win.devToolsWebContents) {
    win.devToolsWebContents.executeJavaScript(injectScript);
  }
};
