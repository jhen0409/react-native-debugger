import path from 'path';
import { app, ipcMain, BrowserWindow, Menu } from 'electron';
import installExtensions from './extensions';
import { checkWindowInfo, createWindow } from './window';
import { startListeningHandleURL } from './url-handle';
import { createMenuTemplate } from './menu';

const iconPath = path.resolve(__dirname, 'logo.png');
const defaultOptions = { iconPath };

startListeningHandleURL(async (host, port) => {
  const wins = BrowserWindow.getAllWindows();
  for (const win of wins) {
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
  for (const win of BrowserWindow.getAllWindows()) {
    if (win.webContents !== event.sender) {
      const { isPortSettingRequired, location } = await checkWindowInfo(win);
      if (location.port === port && !isPortSettingRequired) {
        event.sender.send('check-port-available-reply', false);
        return;
      }
    }
  }
  event.sender.send('check-port-available-reply', true);
});

ipcMain.on('sync-state', async (event, arg) => {
  BrowserWindow.getAllWindows()
    .filter(win => Number(win.webContents.id) !== event.sender.id)
    .forEach(win => {
      win.webContents.send('sync-state', arg);
    });
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length !== 0) return;
  createWindow(defaultOptions);
});

app.on('new-window-for-tab', () =>
  createWindow({ ...defaultOptions, isPortSettingRequired: true })
);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  await installExtensions();

  createWindow(defaultOptions);

  const menuTemplate = createMenuTemplate(defaultOptions);
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
});
