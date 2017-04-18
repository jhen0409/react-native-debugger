import path from 'path';
import { app, BrowserWindow, Menu } from 'electron';
import Config from 'electron-config';
import autoUpdate from './update';
import installExtensions from './extensions';
import { startListeningHandleURL } from './url-handle';
import { createContextMenu, createMenuTemplate } from './menu';

const config = new Config();
const iconPath = path.resolve(__dirname, 'logo.png');
const windowList = [];

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1024,
    height: 750,
    ...config.get('winBounds'),
    show: false,
    backgroundColor: '#272c37',
    tabbingIdentifier: 'rndebugger',
  });

  win.loadURL(`file://${path.resolve(__dirname)}/app.html`);
  win.webContents.on('did-finish-load', () => {
    win.show();
    win.focus();
    if (process.env.OPEN_DEVTOOLS !== '0') {
      win.openDevTools();
    }
    win.checkUpdate = autoUpdate;
    autoUpdate(win, iconPath);
  });
  const index = windowList.push(win) - 1;
  win.on('close', () => {
    config.set('winBounds', win.getBounds());
    windowList.splice(index, 1);
  });
  return win;
};

const checkWorkerRunning = win =>
  new Promise(resolve =>
    win.webContents.executeJavaScript('window.checkWorkerRunning()', result => resolve(result)),
  );

startListeningHandleURL(async (host, port) => {
  if (windowList.length === 0) return null;
  for (const win of windowList) {
    const { isRunning, location } = await checkWorkerRunning(win);
    if (!isRunning || location.port === port) {
      return win;
    }
  }
  createWindow();
  return null;
});

app.on('window-all-closed', () => app.quit());
app.on('ready', async () => {
  await installExtensions();

  createWindow();
  createContextMenu();

  const menuTemplate = createMenuTemplate(iconPath);
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
});
