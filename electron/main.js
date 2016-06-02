const { app, BrowserWindow, Menu, shell } = require('electron');
const url = require('url');
// const qs = require('querystring');

let menu;
let template;
let mainWindow = null;

app.on('window-all-closed', () => {
  app.quit();
});

app.on('open-url', (e, path) => {
  const route = url.parse(path);
  if (route !== 'set-debugger-loc') return;

  // const { host, port } = qs.parse(path);
  // TODO: set debugger hot, port in renderer process
});

app.on('ready', () => {
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

  if (process.platform === 'darwin') {
    template = [{
      label: 'React Native Debugger',
      submenu: [{
        label: 'About React Native Debugger',
        selector: 'orderFrontStandardAboutPanel:',
      }, {
        type: 'separator',
      }, {
        label: 'Services',
        submenu: [],
      }, {
        type: 'separator',
      }, {
        label: 'Hide ElectronReact',
        accelerator: 'Command+H',
        selector: 'hide:',
      }, {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        selector: 'hideOtherApplications:',
      }, {
        label: 'Show All',
        selector: 'unhideAllApplications:',
      }, {
        type: 'separator',
      }, {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() {
          app.quit();
        },
      }],
    }, {
      label: 'View',
      submenu: [{
        label: 'Reload',
        accelerator: 'Command+R',
        click() {
          mainWindow.webContents.reload();
        },
      }, {
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Command+F',
        click() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        },
      }, {
        label: 'Toggle Developer Tools',
        accelerator: 'Alt+Command+I',
        click() {
          mainWindow.toggleDevTools();
        },
      }],
    }, {
      label: 'Window',
      submenu: [{
        label: 'Minimize',
        accelerator: 'Command+M',
        selector: 'performMiniaturize:',
      }, {
        label: 'Close',
        accelerator: 'Command+W',
        selector: 'performClose:',
      }, {
        type: 'separator',
      }, {
        label: 'Bring All to Front',
        selector: 'arrangeInFront:',
      }],
    }, {
      label: 'Help',
      submenu: [{
        label: 'Documentation',
        click() {
          shell.openExternal('https://github.com/jhen0409/react-native-debugger#usage');
        },
      }, {
        label: 'Issues',
        click() {
          shell.openExternal('https://github.com/jhen0409/react-native-debugger/issues');
        },
      }],
    }];

    menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
});
