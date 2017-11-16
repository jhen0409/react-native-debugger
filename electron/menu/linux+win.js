import { shell, BrowserWindow } from 'electron';
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
  close,
  zoom,
  resetZoom,
  haveOpenedWindow,
  toggleOpenInEditor,
} from './util';
import { toggleSyncState, isSyncState } from '../sync-state';

const getWin = () => BrowserWindow.getFocusedWindow();
const viewItems =
  process.env.NODE_ENV === 'developemnt'
    ? [item('Reload Window', 'Alt+CTRL+R', () => reload(getWin()))]
    : [];

export default ({ iconPath }) => [
  menu('RND', [
    item('About', n, () => showAboutDialog(iconPath)),
    item('Check for Updates...', n, () => checkUpdate(iconPath, true)),
    separator,
    item('Stay in Front', n, ({ checked }) => setAlwaysOnTop(getWin(), checked), {
      type: 'checkbox',
      checked: false,
    }),
  ]),
  menu(
    'Debugger',
    [
      item('New Window', 'Ctrl+T', () =>
        createWindow({ iconPath, isPortSettingRequired: haveOpenedWindow() })
      ),
      item('Enable open in editor for console log', n, () => toggleOpenInEditor(getWin()), {
        type: 'checkbox',
        checked: false,
      }),
      item('Toggle Device Sync', n, toggleSyncState, {
        type: 'checkbox',
        checked: isSyncState(),
      }),
      separator,
      item('Close', 'Ctrl+W', () => close(getWin())),
    ],
    'window'
  ),
  menu('Edit', [
    item('Undo', 'Ctrl+Z', n, { selector: 'undo:' }),
    item('Redo', 'Shift+Ctrl+Z', n, { selector: 'redo:' }),
    separator,
    item('Cut', 'Ctrl+X', n, { selector: 'cut:' }),
    item('Copy', 'Ctrl+C', n, { selector: 'copy:' }),
    item('Paste', 'Ctrl+V', n, { selector: 'paste:' }),
    item('Select All', 'Ctrl+A', n, { selector: 'selectAll:' }),
  ]),
  menu(
    'View',
    viewItems.concat([
      item('Toggle Full Screen', 'F11', () => toggleFullscreen(getWin())),
      item('Toggle Developer Tools', 'Alt+Ctrl+I', () => toggleDevTools(getWin(), 'chrome')),
      item('Toggle React DevTools', 'Alt+Ctrl+J', () => toggleDevTools(getWin(), 'react')),
      item('Toggle Redux DevTools', 'Alt+Ctrl+K', () => toggleDevTools(getWin(), 'redux')),
      separator,
      item('Zoom In', 'Ctrl+=', () => zoom(getWin(), 1)),
      item('Zoom Out', 'Ctrl+-', () => zoom(getWin(), -1)),
      item('Reset Zoom', 'Ctrl+0', () => resetZoom(getWin())),
    ])
  ),
  menu('Help', [
    item('Documentation', n, () =>
      shell.openExternal('https://github.com/jhen0409/react-native-debugger/tree/master/docs')
    ),
    item('Issues', n, () =>
      shell.openExternal('https://github.com/jhen0409/react-native-debugger/issues')
    ),
  ]),
];
