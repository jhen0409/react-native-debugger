import { app, shell } from 'electron';
import {
  menu, item, separator, n,
  showAboutDialog, toggleDevTools,
} from './util';

export default (win, iconPath) =>
  [
    menu('React Native Debugger', [
      item('About', n, () => showAboutDialog(iconPath)),
      item('Check for Updates...', n, () => win.checkUpdate(win, iconPath, true)),
      separator,
      item('Hide', 'Command+H', n, { selector: 'hide:' }),
      item('Hide Others', 'Command+Shift+H', n, { selector: 'hideOtherApplications:' }),
      item('Show All', n, n, { selector: 'unhideAllApplications:' }),
      separator,
      item('Quit', 'Command+Q', () => app.quit()),
    ]),
    menu('Edit', [
      item('Undo', 'Command+Z', n, { selector: 'undo:' }),
      item('Redo', 'Shift+Command+Z', n, { selector: 'redo:' }),
      separator,
      item('Cut', 'Command+X', n, { selector: 'cut:' }),
      item('Copy', 'Command+C', n, { selector: 'copy:' }),
      item('Paste', 'Command+V', n, { selector: 'paste:' }),
      item('Select All', 'Command+A', n, { selector: 'selectAll:' }),
    ]),
    menu('View', [
      item('Reload', 'Command+R', () => win.webContents.reload()),
      item('Toggle Full Screen', 'F11', () => win.setFullScreen(!win.isFullScreen())),
      item('Toggle Developer Tools', 'Alt+Command+I', () => win.toggleDevTools()),
      item('Toggle React DevTools', 'Alt+Command+J', () => toggleDevTools(win, 'react')),
      item('Toggle Redux DevTools', 'Alt+Command+K', () => toggleDevTools(win, 'redux')),
    ]),
    menu('Window', [
      item('Minimize', 'Command+M', n, { selector: 'performMiniaturize:' }),
      item('Close', 'Command+W', n, { selector: 'performClose:' }),
      separator,
      item('Bring All to Front', n, n, { selector: 'arrangeInFront:' }),
      item('Stay in Front', n, ({ checked }) => win.setAlwaysOnTop(checked), {
        type: 'checkbox',
        checked: false,
      }),
    ]),
    menu('Help', [
      item('Documentation', n, () =>
        shell.openExternal('https://github.com/jhen0409/react-native-debugger/tree/master/docs')
      ),
      item('Issues', n, () =>
        shell.openExternal('https://github.com/jhen0409/react-native-debugger/issues')
      ),
    ]),
  ];
