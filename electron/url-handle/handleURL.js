import { app } from 'electron';
import net from 'net';
import url from 'url';
import qs from 'querystring';
import * as portfile from './port';

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

const createHandleURLServer = (getWindow) =>
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
  }).listen(0, 'localhost').on('listening', function () {
    const { port } = this.address();
    portfile.write(port);
    portfile.watchExists(() => portfile.write(port));
    process.on('exit', () => portfile.unlink());

    console.log(`Starting listen set-debugger-loc request on port ${port}`);
    console.log('Will save port to `$HOME/.rndebugger_port` file');
  });

export default getWindow => {
  // Handle set-debugger-loc for macOS
  // It's can be automatically open the app
  listenOpenURL(getWindow);
  // Handle set-debugger-loc for macOS/Linux/Windows
  createHandleURLServer(getWindow);
};
