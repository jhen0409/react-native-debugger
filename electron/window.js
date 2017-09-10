import path from 'path';
import { BrowserWindow, Menu } from 'electron';
import Store from 'electron-store';
import autoUpdate from './update';
import { catchConsoleLogLink, removeUnecessaryTabs } from './devtools';

const store = new Store();

const executeJavaScript = (win, script) =>
  new Promise(resolve => win.webContents.executeJavaScript(script, result => resolve(result)));

export const checkWindowInfo = win => executeJavaScript(win, 'window.checkWindowInfo()');

const checkIsOpenInEditorEnabled = win => executeJavaScript(win, 'window.isOpenInEditorEnabled()');

const changeMenuItems = menus => {
  const rootMenuItems = Menu.getApplicationMenu().items;
  Object.entries(menus).forEach(([key, subMenu]) => {
    const rootMenuItem = rootMenuItems.find(({ label }) => label === key);
    if (!rootMenuItem || !rootMenuItem.submenu) return;

    Object.entries(subMenu).forEach(([subKey, menuSet]) => {
      const menuItem = rootMenuItem.submenu.items.find(({ label }) => label === subKey);
      if (!menuItem) return;

      Object.assign(menuItem, menuSet);
    });
  });
};

const onFocus = async win =>
  changeMenuItems({
    Debugger: {
      'Stay in Front': {
        checked: win.isAlwaysOnTop(),
      },
      'Enable open in editor for console log': {
        checked: await checkIsOpenInEditorEnabled(win),
      },
    },
  });

export const createWindow = ({ iconPath, isPortSettingRequired }) => {
  const winBounds = store.get('winBounds');
  const win = new BrowserWindow({
    width: 1024,
    height: 750,
    ...winBounds,
    ...(BrowserWindow.getAllWindows().length && winBounds.x && winBounds.y
      ? {
        x: winBounds.x + 10,
        y: winBounds.y + 10,
      }
      : {}),
    backgroundColor: '#272c37',
    tabbingIdentifier: 'rndebugger',
  });

  let url = `file://${path.resolve(__dirname)}/app.html`;
  if (isPortSettingRequired) {
    url += '?isPortSettingRequired=1';
  }
  win.loadURL(url);
  win.webContents.on('did-finish-load', () => {
    win.webContents.setZoomLevel(store.get('zoomLevel', 0));
    win.focus();
    onFocus(win);
    if (process.env.OPEN_DEVTOOLS !== '0' && !isPortSettingRequired) {
      win.openDevTools();
    }
    if (BrowserWindow.getAllWindows().length === 1) {
      autoUpdate(iconPath);
    }
  });
  win.webContents.on('devtools-opened', async () => {
    const { location } = await checkWindowInfo(win);
    catchConsoleLogLink(win, location.host, location.port);
    removeUnecessaryTabs(win);
  });
  win.on('focus', () => onFocus(win));
  win.on('close', () => {
    store.set('winBounds', win.getBounds());
    win.webContents.getZoomLevel(level => store.set('zoomLevel', level));
  });
  // Try to fix https://github.com/jhen0409/react-native-debugger/issues/81
  // but really not sure because the method works fine on most machines
  win._setEscapeTouchBarItem = () => {}; // eslint-disable-line
  return win;
};
