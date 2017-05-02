import path from 'path';
import { BrowserWindow } from 'electron';
import Config from 'electron-config';
import autoUpdate from './update';

const config = new Config();

export const checkWorkerRunning = win =>
  new Promise(resolve =>
    win.webContents.executeJavaScript('window.checkWorkerRunning()', result => resolve(result))
  );

export const createWindow = ({ iconPath, windowList, isPortSettingRequired }) => {
  const win = new BrowserWindow({
    width: 1024,
    height: 750,
    ...config.get('winBounds'),
    show: false,
    backgroundColor: '#272c37',
    tabbingIdentifier: 'rndebugger',
  });

  let url = `file://${path.resolve(__dirname)}/app.html`;
  if (isPortSettingRequired) {
    url += '?isPortSettingRequired=1';
  }
  win.loadURL(url);
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
