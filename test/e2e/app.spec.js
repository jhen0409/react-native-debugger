import fs from 'fs';
import path from 'path';
import net from 'net';
import { Server as WebSocketServer } from 'ws';
import expect from 'expect';
import electronPath from 'electron-prebuilt';
import { Application } from 'spectron';
import { delay } from '../utils/e2e.js';

describe('Application launch', function spec() {
  this.timeout(10000);

  before(() => {
    this.app = new Application({
      path: electronPath,
      args: ['dist'],
    });
    return this.app.start();
  });

  after(() => {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
  });

  it('should show an initial window', async () => {
    const { client, browserWindow } = this.app;

    await client.waitUntilWindowLoaded();
    await delay(500);
    const title = await browserWindow.getTitle();
    expect(title).toBe(
      'React Native Debugger - Disconnected from proxy. ' +
      'Attempting reconnection. Is node server running?',
    );

    // Focus main window
    await client.windowByIndex(1);
  });

  it('should contain Inspector monitor\'s component on Redux DevTools', async () => {
    const { client } = this.app;

    const val = await client.element('//div[contains(@class, "inspector--jss-")]')
      .getText();
    expect(val).toExist();
  });

  it('should contain an empty actions list on Redux DevTools', async () => {
    const { client } = this.app;

    const val = await client.element('//div[contains(@class, "actionListRows--jss-")]')
      .getText();
    expect(val).toBe('');
  });

  it('should show waiting message on React DevTools', async () => {
    const { client } = this.app;
    const exist = await client.isExisting(
      '//h2[text()="Waiting for a connection from React Native"]'
    );
    expect(exist).toBe(true);
  });

  const getURLFromConnection = server =>
    new Promise(resolve => {
      server.on('connection', socket => {
        resolve(socket.upgradeReq.url);
        server.close();
      });
    });

  it('should connect to fake RN server', async () => {
    const server = new WebSocketServer({ port: 8081 });

    const url = await getURLFromConnection(server);
    expect(url).toBe('/debugger-proxy?role=debugger&name=Chrome');
  });

  it('should connect to fake RN server (port 8087) with send set-debugger-loc after', async () => {
    const port = 8087;
    const server = new WebSocketServer({ port });

    const rndPath = `rndebugger://set-debugger-loc?host=localhost&port=${port}`;

    const homeEnv = process.platform === 'win32' ? 'USERPROFILE' : 'HOME';
    const portFile = path.join(process.env[homeEnv], '.rndebugger_port');
    const rndPort = fs.readFileSync(portFile, 'utf-8');

    const sendSuccess = await new Promise(resolve => {
      const socket = net.createConnection({ port: rndPort }, () => {
        let pass;
        socket.setEncoding('utf-8');
        socket.write(JSON.stringify({ path: rndPath }));
        socket.on('data', data => {
          pass = data === 'success';
          socket.end();
        });
        socket.on('end', () => resolve(pass));
        setTimeout(() => socket.end(), 1000);
      });
    });
    expect(sendSuccess).toBe(true);

    const url = await getURLFromConnection(server);
    expect(url).toBe('/debugger-proxy?role=debugger&name=Chrome');
  });
});
