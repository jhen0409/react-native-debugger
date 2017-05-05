import { shell, BrowserWindow } from 'electron';
import { createWindow } from '../window';
import {
  menu,
  item,
  separator,
  n,
  showAboutDialog,
  toggleDevTools,
  toggleFullscreen,
  setAlwaysOnTop,
  reload,
  close,
} from './util';

const getWin = () => BrowserWindow.getFocusedWindow();

export default ({ iconPath, windowList }) => [
  menu('RND', [
    item('About', n, () => showAboutDialog(iconPath)),
    item('Check for Updates...', n, () => {
      const win = getWin();
      win.checkUpdate(win, iconPath, true);
    }),
    separator,
    item('Stay in Front', n, ({ checked }) => setAlwaysOnTop(getWin(), checked), {
      type: 'checkbox',
      checked: false,
    }),
  ]),
  menu('Debugger', [
    item('New Window', 'Ctrl+T', () =>
      createWindow({ iconPath, windowList, isPortSettingRequired: !!windowList.length })
    ),
    separator,
    item('Close', 'Ctrl+W', () => close(getWin())),
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
    item('Reload', 'Ctrl+R', () => reload(getWin())),
    item('Toggle Full Screen', 'F11', () => toggleFullscreen(getWin())),
    item('Toggle Developer Tools', 'Alt+Ctrl+I', () => toggleDevTools(getWin(), 'chrome')),
    item('Toggle React DevTools', 'Alt+Command+J', () => toggleDevTools(getWin(), 'react')),
    item('Toggle Redux DevTools', 'Alt+Command+K', () => toggleDevTools(getWin(), 'redux')),
  ]),
  menu('Help', [
    item('Documentation', n, () =>
      shell.openExternal('https://github.com/jhen0409/react-native-debugger#usage')
    ),
    item('Issues', n, () =>
      shell.openExternal('https://github.com/jhen0409/react-native-debugger/issues')
    ),
  ]),
];
