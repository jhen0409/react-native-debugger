import { resolve } from 'path';
import { app, BrowserWindow, Menu } from 'electron';
import Config from 'electron-config';
import autoUpdate from './update';
import installExtensions from './extensions';
import { startListeningHandleURL } from './url-handle';
import { createContextMenu, createMenuTemplate } from './menu';

const config = new Config();
const iconPath = resolve(__dirname, 'logo.png');
let mainWindow = null;

startListeningHandleURL(() => mainWindow);

app.on('window-all-closed', () => app.quit());
app.on('ready', async () => {
  await installExtensions();

  mainWindow = new BrowserWindow({
    width: 1024,
    height: 750,
    ...config.get('winBounds'),
    show: false,
    backgroundColor: '#272c37',
  });
  createContextMenu(mainWindow);

  mainWindow.loadURL(`file://${resolve(__dirname)}/app.html`);

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
    mainWindow.focus();
    if (process.env.OPEN_DEVTOOLS !== '0') {
      mainWindow.openDevTools();
    }
    mainWindow.checkUpdate = autoUpdate;
    autoUpdate(mainWindow, iconPath);
  });
  mainWindow.on('close', () => {
    config.set('winBounds', mainWindow.getBounds());
    mainWindow = null;
  });

  const menuTemplate = createMenuTemplate(mainWindow, iconPath);
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
});
