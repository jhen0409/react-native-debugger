const { app, BrowserWindow } = require('electron');

let mainWindow = null;

app.on('window-all-closed', () => {
  app.quit();
});

app.on('ready', () => {
  mainWindow = new BrowserWindow({ width: 1024, height: 750 });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  mainWindow.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});
