import path from 'path';
import { BrowserWindow } from 'electron';
import Config from 'electron-config';
import autoUpdate from './update';

const config = new Config();

export const checkWindowInfo = win =>
  new Promise(resolve =>
    win.webContents.executeJavaScript('window.checkWindowInfo()', result => resolve(result))
  );

export const createWindow = ({ iconPath, isPortSettingRequired }) => {
  const winBounds = config.get('winBounds');
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
    win.focus();
    if (process.env.OPEN_DEVTOOLS !== '0' && !isPortSettingRequired) {
      win.openDevTools();
    }
    if (BrowserWindow.getAllWindows().length === 1) {
      autoUpdate(iconPath);
    }
  });
  win.on('close', () => config.set('winBounds', win.getBounds()));
  return win;
};
