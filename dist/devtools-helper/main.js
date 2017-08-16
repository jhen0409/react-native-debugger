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
    console.log(data.type, data);
    return;
  }
  chrome.devtools.inspectedWindow.eval(`
    if (window.openInEditor) {
      window.openInEditor(data.source);
    }
  `);
});
