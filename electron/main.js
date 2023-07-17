import path from 'path';
import { app, ipcMain, session, BrowserWindow, Menu } from 'electron';
import { initialize } from '@electron/remote/main';
import normalizeHeaderCase from 'header-case-normalizer';
import installExtensions from './extensions';
import { checkWindowInfo, createWindow } from './window';
import { startListeningHandleURL, handleURL, parseUrl } from './url-handle';
import { createMenuTemplate } from './menu';
import { readConfig } from './config';
import { sendSyncState } from './sync-state';

initialize();

// Uncomment if want to debug devtools backend
// app.commandLine.appendSwitch('remote-debugging-port', '9222');

app.commandLine.appendSwitch('disable-http-cache');

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 1;

const iconPath = path.resolve(__dirname, 'logo.png');
const defaultOptions = { iconPath };


const findWindow = async (host, port) => {
  const wins = BrowserWindow.getAllWindows();
  for (const win of wins) {
    const { isWorkerRunning, isPortSettingRequired, location } =
      await checkWindowInfo(win);
    if (
      (!isWorkerRunning || location.port === port) &&
      !isPortSettingRequired
    ) {
      if (win.isMinimized()) win.restore();
      win.focus();
      return win;
    }
  }
  createWindow(defaultOptions);
  return null;
};

const handleCommandLine = async (commandLine) => {
  const url = commandLine.find((arg) => arg.startsWith('rndebugger://'));
  if (!url) {
    return;
  }
  await handleURL(findWindow, url);
};

if (process.platform === 'linux') {
  const singleInstanceLock = app.requestSingleInstanceLock();
  if (!singleInstanceLock) {
    process.exit();
  } else {
    app.on('second-instance', async (event, commandLine) => {
      await handleCommandLine(commandLine);
    });
  }
}

startListeningHandleURL(findWindow);

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

  if (process.platform === 'linux') {
    const url = process.argv.find((arg) => arg.startsWith('rndebugger://'));
    const query = url ? parseUrl(url) : undefined;
    if (query && query.port) {
      defaultRNPackagerPorts = [query.port];
    }
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
        const originalHeader = normalizeHeaderCase(header.replace(replaceHeaderPrefix, ''));
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
