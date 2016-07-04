import { app, BrowserWindow, Menu } from 'electron';
import { startListeningHandleURL } from './url-handle';
import { createContextMenu, createMenuTemplate } from './menu';

let mainWindow = null;

startListeningHandleURL(() => mainWindow);

app.on('window-all-closed', () => app.quit());
app.on('ready', () => {
  createContextMenu(mainWindow);

  mainWindow = new BrowserWindow({ width: 1024, height: 750, show: false });
  mainWindow.loadURL(`file://${__dirname}/app.html`);
  mainWindow.openDevTools();

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
    mainWindow.focus();
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuTemplate = createMenuTemplate(mainWindow);
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
});
