import path from 'path';
import { BrowserWindow, Menu, globalShortcut } from 'electron';
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

const invokeDevMethod = (win, name) =>
  executeJavaScript(win, `window.invokeDevMethod && window.invokeDevMethod('${name}')`);

const registerKeyboradShortcut = win => {
  const prefix = process.platform === 'darwin' ? 'Command' : 'Ctrl';
  // If another window focused, register a new shortcut
  if (globalShortcut.isRegistered(`${prefix}+R`) || globalShortcut.isRegistered(`${prefix}+I`)) {
    globalShortcut.unregisterAll();
  }
  globalShortcut.register(`${prefix}+R`, () => invokeDevMethod(win, 'reload'));
  globalShortcut.register(`${prefix}+I`, () => invokeDevMethod(win, 'toggleElementInspector'));
};

const unregisterKeyboradShortcut = () => globalShortcut.unregisterAll();

const registerShortcuts = async win => {
  registerKeyboradShortcut(win);
  changeMenuItems({
    Debugger: {
      'Stay in Front': {
        checked: win.isAlwaysOnTop(),
      },
      'Enable Open in Editor for Console Log': {
        checked: await checkIsOpenInEditorEnabled(win),
      },
    },
  });
};

const minSize = 100;
export const createWindow = ({ iconPath, isPortSettingRequired }) => {
  const winBounds = store.get('winBounds');
  const increasePosition = BrowserWindow.getAllWindows().length * 10;
  const { width, height } = winBounds || {};
  const win = new BrowserWindow({
    ...winBounds,
    width: width && width >= minSize ? width : 1024,
    height: height && height >= minSize ? height : 750,
    minWidth: minSize,
    minHeight: minSize,
    ...(increasePosition && winBounds.x && winBounds.y
      ? {
        x: winBounds.x + increasePosition,
        y: winBounds.y + increasePosition,
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
    registerShortcuts(win);
    if (process.env.E2E_TEST !== '1' && !isPortSettingRequired) {
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
  win.on('show', () => {
    if (!win.isFocused()) return;
    registerShortcuts(win);
  });
  win.on('focus', () => registerShortcuts(win));
  win.on('restore', () => registerShortcuts(win));
  win.on('hide', () => unregisterKeyboradShortcut());
  win.on('blur', () => unregisterKeyboradShortcut());
  win.on('minimize', () => unregisterKeyboradShortcut());
  win.close = async () => {
    unregisterKeyboradShortcut();
    store.set('winBounds', win.getBounds());
    win.webContents.getZoomLevel(level => store.set('zoomLevel', level));
    await executeJavaScript(win, 'window.beforeWindowClose && window.beforeWindowClose()');
    win.destroy();
  };
  win.on('close', event => {
    event.preventDefault();
    win.close();
  });

  // https://github.com/electron/electron/issues/10442
  win._setEscapeTouchBarItem = () => {}; // eslint-disable-line

  return win;
};
