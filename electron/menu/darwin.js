import { app, shell, BrowserWindow } from 'electron';
import { createWindow } from '../window';
import checkUpdate from '../update';
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
  zoom,
  resetZoom,
  haveOpenedWindow,
  toggleOpenInEditor,
} from './util';

const getWin = () => BrowserWindow.getFocusedWindow();

export default ({ iconPath }) => [
  menu('React Native Debugger', [
    item('About', n, () => showAboutDialog(iconPath)),
    item('Check for Updates...', n, () => checkUpdate(iconPath, true)),
    separator,
    item('Hide', 'Command+H', n, { selector: 'hide:' }),
    item('Hide Others', 'Command+Shift+H', n, { selector: 'hideOtherApplications:' }),
    item('Show All', n, n, { selector: 'unhideAllApplications:' }),
    separator,
    item('Quit', 'Command+Q', () => app.quit()),
  ]),
  menu(
    'Debugger',
    [
      item('New Window', 'Command+T', () =>
        createWindow({ iconPath, isPortSettingRequired: haveOpenedWindow() })
      ),
      item('Enable open in editor for console log', n, () => toggleOpenInEditor(getWin()), {
        type: 'checkbox',
        checked: false,
      }),
      separator,
      item('Minimize', 'Command+M', n, { selector: 'performMiniaturize:' }),
      item('Close', 'Command+W', n, { selector: 'performClose:' }),
      separator,
      item('Bring All to Front', n, n, { selector: 'arrangeInFront:' }),
      item('Stay in Front', n, ({ checked }) => setAlwaysOnTop(getWin(), checked), {
        type: 'checkbox',
        checked: false,
      }),
    ],
    'window'
  ),
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
    item('Reload', 'Command+R', () => reload(getWin())),
    item('Toggle Full Screen', 'F11', () => toggleFullscreen(getWin())),
    item('Toggle Developer Tools', 'Alt+Command+I', () => toggleDevTools(getWin(), 'chrome')),
    item('Toggle React DevTools', 'Alt+Command+J', () => toggleDevTools(getWin(), 'react')),
    item('Toggle Redux DevTools', 'Alt+Command+K', () => toggleDevTools(getWin(), 'redux')),
    separator,
    item('Zoom In', 'Command+=', () => zoom(getWin(), 1)),
    item('Zoom Out', 'Command+-', () => zoom(getWin(), -1)),
    item('Reset Zoom', 'Command+0', () => resetZoom(getWin())),
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
