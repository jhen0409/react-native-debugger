const detectChromeDevToolsTheme = () =>
  chrome.devtools.panels.themeName || 'default';

const themeName = detectChromeDevToolsTheme();

chrome.devtools.inspectedWindow.eval(`
  window.chromeDevToolsTheme = '${themeName}';
  if (window.notifyDevToolsThemeChange) {
    window.notifyDevToolsThemeChange(window.chromeDevToolsTheme);
  }
`);
