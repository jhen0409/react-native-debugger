import { app, shell, BrowserWindow } from 'electron';
import { createWindow } from '../window';
import { menu, item, separator, n, showAboutDialog, toggleDevTools } from './util';

const getWin = () => BrowserWindow.getFocusedWindow();

export default ({ iconPath, windowList }) => [
  menu('React Native Debugger', [
    item('About', n, () => showAboutDialog(iconPath)),
    item('Check for Updates...', n, () => {
      const win = getWin();
      win.checkUpdate(win, iconPath, true);
    }),
    separator,
    item('Hide', 'Command+H', n, { selector: 'hide:' }),
    item('Hide Others', 'Command+Shift+H', n, { selector: 'hideOtherApplications:' }),
    item('Show All', n, n, { selector: 'unhideAllApplications:' }),
    separator,
    item('Quit', 'Command+Q', () => app.quit()),
  ]),
  menu('Debugger', [
    item('New Window', 'Command+T', () =>
      createWindow({ iconPath, windowList, isPortSettingRequired: true })
    ),
    separator,
    item('Minimize', 'Command+M', n, { selector: 'performMiniaturize:' }),
    item('Close', 'Command+W', n, { selector: 'performClose:' }),
    separator,
    item('Bring All to Front', n, n, { selector: 'arrangeInFront:' }),
    item('Stay in Front', n, ({ checked }) => getWin().setAlwaysOnTop(checked), {
      type: 'checkbox',
      checked: false,
    }),
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
    item('Reload', 'Command+R', () => getWin().webContents.reload()),
    item('Toggle Full Screen', 'F11', () => {
      const win = getWin();
      win.setFullScreen(!win.isFullScreen());
    }),
    item('Toggle Developer Tools', 'Alt+Command+I', () => getWin().toggleDevTools()),
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
