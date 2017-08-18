const detectChromeDevToolsTheme = () => chrome.devtools.panels.themeName || 'default';

const themeName = detectChromeDevToolsTheme();

chrome.devtools.inspectedWindow.eval(`
  window.chromeDevToolsTheme = '${themeName}';
  if (window.notifyDevToolsThemeChange) {
    window.notifyDevToolsThemeChange(window.chromeDevToolsTheme);
  }
`);

window.addEventListener('message', ({ data }) => {
  if (data.type !== 'open-in-editor') {
    return;
  }
  const arr = data.source.split(':');
  const lineNumber = arr.pop(-1);
  const file = arr.join(':');
  chrome.devtools.inspectedWindow.eval(`
    if (window.openInEditor) {
      window.openInEditor('${file}', ${Number(lineNumber)});
    }
  `);
});
