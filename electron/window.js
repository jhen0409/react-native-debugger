import path from 'path';
import { BrowserWindow } from 'electron';
import Config from 'electron-config';
import autoUpdate from './update';

const config = new Config();

export const checkWindowInfo = win =>
  new Promise(resolve =>
    win.webContents.executeJavaScript('window.checkWindowInfo()', result => resolve(result))
  );

export const createWindow = ({ iconPath, windowList, isPortSettingRequired }) => {
  const winBounds = config.get('winBounds');
  const win = new BrowserWindow({
    width: 1024,
    height: 750,
    ...winBounds,
    ...(windowList.length && winBounds.x && winBounds.y
      ? {
        x: winBounds.x + 10,
        y: winBounds.y + 10,
      }
      : {}),
    show: false,
    backgroundColor: '#272c37',
    tabbingIdentifier: 'rndebugger',
  });

  let url = `file://${path.resolve(__dirname)}/app.html`;
  if (isPortSettingRequired) {
    url += '?isPortSettingRequired=1';
  }
  win.loadURL(url);
  const index = windowList.push(win) - 1;
  win.webContents.on('did-finish-load', () => {
    win.show();
    win.focus();
    if (process.env.OPEN_DEVTOOLS !== '0' && !isPortSettingRequired) {
      win.openDevTools();
    }
    if (index === 0) {
      autoUpdate(iconPath);
    }
  });
  win.on('close', () => {
    config.set('winBounds', win.getBounds());
    const currentIndex = windowList.indexOf(win);
    if (currentIndex > -1) {
      windowList.splice(currentIndex, 1);
    }
  });
  return win;
};
