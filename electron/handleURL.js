const { app } = require('electron');
const net = require('net');
const url = require('url');
const qs = require('querystring');

const handleURL = (win, path) => {
  const route = url.parse(path);

  if (route.host !== 'set-debugger-loc') return;

  const { host, port } = qs.parse(route.query);
  const payload = JSON.stringify({
    host: host || 'localhost',
    port: Number(port) || 8081,
  });
  if (win) {
    win.webContents.send('set-debugger-loc', payload);
  } else {
    process.env.DEBUGGER_SETTING = payload;
  }
};

const listenOpenURL = getWindow =>
  app.on('open-url', (e, path) => {
    handleURL(getWindow(), path);
  });

const createHandleURLServer = (port = 8997, getWindow) =>
  net.createServer(socket => {
    let data;
    socket.setEncoding('utf-8');
    socket.on('data', chunk => { data += chunk; });
    socket.on('end', () => {
      try {
        const obj = JSON.parse(data);
        if (typeof obj.path === 'string') {
          handleURL(getWindow(), obj.path);
        }
      } catch (e) {} // eslint-disable-line
    });
  }).listen(port, 'localhost');

module.exports = (getWindow, port) => {
  if (process.platform === 'darwin') {
    // Handle set-debugger-loc for macOS
    // It's can be automatically open the app
    listenOpenURL(getWindow);
  } else {
    // Handle set-debugger-loc for Linux/Windows
    createHandleURLServer(getWindow, port);
  }
};
