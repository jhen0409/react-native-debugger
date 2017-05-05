import path from 'path';
import { app, Menu } from 'electron';
import installExtensions from './extensions';
import { checkWorkerRunning, createWindow } from './window';
import { startListeningHandleURL } from './url-handle';
import { createContextMenu, createMenuTemplate } from './menu';

const iconPath = path.resolve(__dirname, 'logo.png');
const windowList = [];
const defaultOptions = { iconPath, windowList };

startListeningHandleURL(async (host, port) => {
  if (windowList.length === 0) return null;
  for (const win of windowList) {
    const { isRunning, location } = await checkWorkerRunning(win);
    if (!isRunning || location.port === port) {
      return win;
    }
  }
  createWindow(defaultOptions);
  return null;
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
