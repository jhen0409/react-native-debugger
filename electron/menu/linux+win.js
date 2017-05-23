import { shell } from 'electron';
import {
  menu, item, separator, n,
  showAboutDialog, toggleDevTools,
} from './util';

export default (win, iconPath) =>
  [
    menu('RND', [
      item('About', n, () => showAboutDialog(iconPath)),
      item('Check for Updates...', n, () => win.checkUpdate(win, iconPath, true)),
      separator,
      item('Stay in Front', n, ({ checked }) => win.setAlwaysOnTop(checked), {
        type: 'checkbox',
        checked: false,
      }),
      separator,
      item('Close', 'Ctrl+W', () => win.close()),
    ]),
    menu('Edit', [
      item('Undo', 'Ctrl+Z', n, { selector: 'undo:' }),
      item('Redo', 'Shift+Ctrl+Z', n, { selector: 'redo:' }),
      separator,
      item('Cut', 'Ctrl+X', n, { selector: 'cut:' }),
      item('Copy', 'Ctrl+C', n, { selector: 'copy:' }),
      item('Paste', 'Ctrl+V', n, { selector: 'paste:' }),
      item('Select All', 'Ctrl+A', n, { selector: 'selectAll:' }),
    ]),
    menu('View', [
      item('Reload', 'Ctrl+R', () => win.webContents.reload()),
      item('Toggle Full Screen', 'F11', () => win.setFullScreen(!win.isFullScreen())),
      item('Toggle Developer Tools', 'Alt+Ctrl+I', () => win.toggleDevTools()),
      item('Toggle React DevTools', 'Alt+Command+J', () => toggleDevTools(win, 'react')),
      item('Toggle Redux DevTools', 'Alt+Command+K', () => toggleDevTools(win, 'redux')),
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
