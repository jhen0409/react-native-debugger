import fs from 'fs';
import path from 'path';
import net from 'net';
import webpack from 'webpack';
import { Server as WebSocketServer } from 'ws';
import expect from 'expect';
import electronPath from 'electron';
import { Application } from 'spectron';
import { delay } from '../utils/e2e.js';

describe('Application launch', function spec() {
  this.timeout(6E4);

  before(async () => {
    await new Promise(resolve =>
      webpack({
        entry: './test/e2e/fixture/app',
        output: {
          filename: './test/e2e/fixture/app.bundle.js',
        },
      }).run(resolve)
    );
    this.app = new Application({
      path: electronPath,
      args: ['--user-dir=test/e2e/tmp', 'dist'],
      env: {
        REACT_ONLY_FOR_LOCAL: 1,
      },
    });
    return this.app.start();
  });

  after(() => {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
  });

  it(`should be v${process.env.npm_package_version}`, async () => {
    const { electron } = this.app;
    const version = await electron.remote.app.getVersion();
    expect(version).toBe(process.env.npm_package_version);
  });

  it('should show an initial window', async () => {
    const { client, browserWindow } = this.app;

    await client.waitUntilWindowLoaded();
    await delay(2000);
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

    const val = await client.element('//div[contains(@class, "inspector-")]')
      .getText();
    expect(val).toExist();
  });

  it('should contain an empty actions list on Redux DevTools', async () => {
    const { client } = this.app;

    const val = await client.element('//div[contains(@class, "actionListRows-")]')
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

  const customRNServerPort = 8087;
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
    const server = new WebSocketServer({ port: customRNServerPort });

    const rndPath = `rndebugger://set-debugger-loc?host=localhost&port=${customRNServerPort}`;
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

  describe('Import fake script after', () => {
    before(() => {
      const server = new WebSocketServer({ port: customRNServerPort });

      return new Promise(resolve => {
        server.on('connection', socket => {
          socket.on('message', message => {
            const data = JSON.parse(message);
            switch (data.replyID) {
              case 'createJSRuntime':
                socket.send(JSON.stringify({
                  id: 'sendFakeScript',
                  method: 'executeApplicationScript',
                  inject: [],
                  url: '../../test/e2e/fixture/app.bundle.js',
                }));
                break;
              case 'sendFakeScript':
                return resolve();
              default:
                console.error(`Unexperted id ${data.replyID}`);
            }
          });
          socket.send(JSON.stringify({
            id: 'createJSRuntime',
            method: 'prepareJSRuntime',
          }));
        });
      });
    });

    it('should have @@INIT action on Redux DevTools', async () => {
      const { client } = this.app;
      const val = await client.element('//div[contains(@class, "actionListRows-")]')
        .getText();
      expect(val).toMatch(/@@redux\/INIT/);
    });

    it('should have four store instances on Redux DevTools', async () => {
      const { client } = this.app;
      const wait = () => delay(750);

      // Click dropdown
      await client.element('//div[text()="Autoselect instances"]')
        .click().then(wait);
      // Click `Store instance 1`
      await client.element('//div[text()="Store instance 1"]')
        .click().then(wait);
      let val = await client.element('//div[contains(@class, "actionListRows-")]')
        .getText();
      expect(val).toMatch(/@@INIT/);
      expect(val).toMatch(/TEST_PASS_FOR_STORE_1/);
      expect(val).toNotMatch(/TEST_PASS_FOR_STORE_2/);

      // Click dropdown
      await client.element('//div[text()="Store instance 1"]')
        .click().then(wait);
      // Click `Store instance 2`
      await client.element('//div[text()="Store instance 2"]')
        .click().then(wait);
      val = await client.element('//div[contains(@class, "actionListRows-")]')
        .getText();
      expect(val).toMatch(/@@INIT/);
      expect(val).toMatch(/TEST_PASS_FOR_STORE_2/);
      expect(val).toNotMatch(/TEST_PASS_FOR_STORE_1/);

      // Click dropdown
      await client.element('//div[text()="Store instance 2"]')
        .click().then(wait);
      // Click `Store instance 2`
      await client.element('//div[text()="Store instance 3 for MobX"]')
        .click().then(wait);
      val = await client.element('//div[contains(@class, "actionListRows-")]')
        .getText();
      expect(val).toMatch(/@@INIT/);
      expect(val).toMatch(/increment/);
      expect(val).toNotMatch(/TEST_PASS_FOR_STORE_2/);

      // Click dropdown
      await client.element('//div[text()="Store instance 3 for MobX"]')
        .click().then(wait);
      // Click `Store instance 2`
      await client.element('//div[text()="Store instance 4 for RemoteDev"]')
        .click().then(wait);
      val = await client.element('//div[contains(@class, "actionListRows-")]')
        .getText();
      expect(val).toMatch(/@@redux\/INIT/);
      expect(val).toMatch(/TEST_PASS_FOR_STORE_4/);
      expect(val).toNotMatch(/increment/);
    });
  });
});
