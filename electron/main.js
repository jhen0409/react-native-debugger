import path from 'path';
import { app, ipcMain, session, BrowserWindow, Menu } from 'electron';
import installExtensions from './extensions';
import { checkWindowInfo, createWindow } from './window';
import { startListeningHandleURL } from './url-handle';
import { createMenuTemplate } from './menu';
import { readConfig } from './config';
import { sendSyncState } from './sync-state';

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

ipcMain.on('sync-state', sendSyncState);

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

if (process.platform === 'darwin') {
  app.on('before-quit', async event => {
    event.preventDefault();
    for (const win of BrowserWindow.getAllWindows()) {
      win.removeAllListeners('close');
      await win.close();
    }
    process.exit();
  });
}

app.on('ready', async () => {
  await installExtensions();

  const { config } = readConfig();

  let { defaultRNPackagerPorts } = config;
  if (!Array.isArray(defaultRNPackagerPorts)) {
    defaultRNPackagerPorts = [8081];
  }

  defaultRNPackagerPorts.forEach(port => {
    createWindow({ port, ...defaultOptions });
  });

  const menuTemplate = createMenuTemplate(defaultOptions);
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  const replaceHeaderPrefix = '__RN_DEBUGGER_SET_HEADER_REQUEST_';
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    delete details.requestHeaders.Origin;
    Object.entries(details.requestHeaders).forEach(([header, value]) => {
      if (header.startsWith(replaceHeaderPrefix)) {
        const originalHeader = header.replace(replaceHeaderPrefix, '');
        details.requestHeaders[originalHeader] = value;
        delete details.requestHeaders[header];
      }
    });
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });
});

// Pass all certificate errors in favor of Network Inspect feature
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  event.preventDefault();
  callback(true);
});
