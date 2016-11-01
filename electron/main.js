import { resolve } from 'path';
import { app, BrowserWindow, Menu } from 'electron';
import { startListeningHandleURL } from './url-handle';
import { createContextMenu, createMenuTemplate } from './menu';

const installExtensions = async () => {
  if (process.env.NODE_ENV === 'development') {
    const installer = require('electron-devtools-installer'); // eslint-disable-line

    const extensions = [
      'REACT_DEVELOPER_TOOLS',
      'REDUX_DEVTOOLS',
    ];
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    for (const name of extensions) {
      try {
        await installer.default(installer[name], forceDownload);
      } catch (e) {} // eslint-disable-line
    }
  }
};

const iconPath = resolve(__dirname, 'logo.png');
let mainWindow = null;

startListeningHandleURL(() => mainWindow);

app.on('window-all-closed', () => app.quit());
app.on('ready', async () => {
  await installExtensions();

  mainWindow = new BrowserWindow({ width: 1024, height: 750, show: false });
  createContextMenu(mainWindow);

  mainWindow.loadURL(`file://${resolve(__dirname)}/app.html`);
  mainWindow.openDevTools();

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
    mainWindow.focus();
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuTemplate = createMenuTemplate(mainWindow, iconPath);
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
});
