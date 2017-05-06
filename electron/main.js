import path from 'path';
import { app, ipcMain, Menu } from 'electron';
import installExtensions from './extensions';
import { checkWindowInfo, createWindow } from './window';
import { startListeningHandleURL } from './url-handle';
import { createContextMenu, createMenuTemplate } from './menu';

const iconPath = path.resolve(__dirname, 'logo.png');
const windowList = [];
const defaultOptions = { iconPath, windowList };

startListeningHandleURL(async (host, port) => {
  if (windowList.length === 0) return null;
  for (const win of windowList) {
    const { isWorkerRunning, isPortSettingRequired, location } = await checkWindowInfo(win);
    if ((!isWorkerRunning || location.port === port) && !isPortSettingRequired) {
      return win;
    }
  }
  createWindow(defaultOptions);
  return null;
});

ipcMain.on('check-port-available', async (event, arg) => {
  const port = Number(arg);
  for (const win of windowList) {
    if (win.webContents !== event.sender) {
      const { isPortSettingRequired, location } = await checkWindowInfo(win);
      if (!isPortSettingRequired && location.port === port) {
        event.sender.send('check-port-available-reply', false);
        return;
      }
    }
  }
  event.sender.send('check-port-available-reply', true);
});

app.on('activate', () => {
  if (windowList.length !== 0) return;
  createWindow(defaultOptions);
});

app.on('window-all-closed', () => {
  windowList.splice(0, windowList.length);
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  await installExtensions();

  createWindow(defaultOptions);
  createContextMenu();

  const menuTemplate = createMenuTemplate(defaultOptions);
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
});
