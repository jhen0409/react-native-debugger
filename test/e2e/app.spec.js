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
  this.timeout(6e4);

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
        OPEN_DEVTOOLS: 0,
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
    expect(title).toBe('React Native Debugger - Attempting reconnection (port 8081)');

    // Avoid RND clear logs
    await this.app.webContents.executeJavaScript('console.clear = noop => noop');
  });

  it('should portfile (for debugger-open usage) always exists in home dir', async () => {
    const portFile = path.join(process.env.USERPROFILE || process.env.HOME, '.rndebugger_port');

    expect(fs.existsSync(portFile)).toBe(true);
    fs.unlinkSync(portFile);

    let attempts = 10;
    let expected = false;
    while (attempts > 0 && !expected) {
      expected = fs.existsSync(portFile);
      await delay(100);
      attempts--;
    }
    expect(expected).toBe(true);
  });

  it("should contain Inspector monitor's component on Redux DevTools", async () => {
    const { client } = this.app;

    const val = await client.element('//div[contains(@class, "inspector-")]').getText();
    expect(val).toExist();
  });

  it('should contain an empty actions list on Redux DevTools', async () => {
    const { client } = this.app;

    const val = await client.element('//div[contains(@class, "actionListRows-")]').getText();
    expect(val).toBe('');
  });

  it('should show waiting message on React DevTools', async () => {
    const { client } = this.app;
    const exist = await client.isExisting('//h2[text()="Waiting for React to connect…"]');
    expect(exist).toBe(true);
  });

  const customRNServerPort = 8088;
  const getURLFromConnection = server =>
    new Promise(resolve => {
      server.on('connection', (socket, req) => {
        resolve(req.url);
      });
    });

  it('should connect to fake RN server', async () => {
    const server = new WebSocketServer({ port: 8081 });

    const url = await getURLFromConnection(server);
    expect(url).toBe('/debugger-proxy?role=debugger&name=Chrome');

    const title = await this.app.browserWindow.getTitle();
    expect(title).toBe('React Native Debugger - Waiting for client connection (port 8081)');
    server.close();
  });

  it('should connect to fake RN server (port 8088) with send set-debugger-loc after', async () => {
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

    const title = await this.app.browserWindow.getTitle();
    expect(title).toBe(
      `React Native Debugger - Waiting for client connection (port ${customRNServerPort})`
    );
    server.close();
  });

  describe('Import fake script after', () => {
    before(async () => {
      const server = new WebSocketServer({ port: customRNServerPort });

      await new Promise(resolve => {
        server.on('connection', socket => {
          socket.on('message', message => {
            const data = JSON.parse(message);
            switch (data.replyID) {
              case 'createJSRuntime':
                socket.send(
                  JSON.stringify({
                    id: 'sendFakeScript',
                    method: 'executeApplicationScript',
                    inject: [],
                    url: '../../test/e2e/fixture/app.bundle.js',
                  })
                );
                break;
              case 'sendFakeScript':
                return resolve();
              default:
                console.error(`Unexperted id ${data.replyID}, data:`, data);
            }
          });
          socket.send(
            JSON.stringify({
              id: 'createJSRuntime',
              method: 'prepareJSRuntime',
            })
          );
        });
      });
      const title = await this.app.browserWindow.getTitle();
      expect(title).toBe(`React Native Debugger - Connected (port ${customRNServerPort})`);
    });

    it('should have @@INIT action on Redux DevTools', async () => {
      const { client } = this.app;
      const val = await client.element('//div[contains(@class, "actionListRows-")]').getText();
      expect(val).toMatch(/@@redux\/INIT/); // Last store is `RemoteDev store instance 1`
    });

    let currentInstance = 'Autoselect instances'; // Default instance
    const wait = () => delay(750);
    const selectInstance = async (client, instance) => {
      await client.element(`//div[text()="${currentInstance}"]`).click().then(wait);
      currentInstance = instance;
      return client.element(`//div[text()="${instance}"]`).click().then(wait);
    };

    const expectActions = {
      'Redux store instance 1': {
        expt: [/@@INIT/, /TEST_PASS_FOR_REDUX_STORE_1/, /SHOW_FOR_REDUX_STORE_1/],
        notExpt: [/NOT_SHOW_FOR_REDUX_STORE_1/, /TEST_PASS_FOR_REDUX_STORE_2/],
      },
      'Redux store instance 2': {
        expt: [/@@INIT/, /TEST_PASS_FOR_REDUX_STORE_2/],
        notExpt: [
          /TEST_PASS_FOR_REDUX_STORE_1/,
          /NOT_SHOW_1_FOR_REDUX_STORE_2/,
          /NOT_SHOW_1_FOR_REDUX_STORE_2/,
        ],
      },
      'MobX store instance 1': {
        expt: [/@@INIT/, /testPassForMobXStore1/],
        notExpt: [/TEST_PASS_FOR_REDUX_STORE_2/],
      },
      'MobX store instance 2': {
        expt: [/@@INIT/, /testPassForMobXStore2/],
        notExpt: [/testPassForMobXStore1/],
      },
      'RemoteDev store instance 1': {
        expt: [/@@redux\/INIT/, /TEST_PASS_FOR_REMOTEDEV_STORE_1/],
        notExpt: [/testPassForMobXStore2/],
      },
    };

    const runExpectActions = (name, val) => {
      const { expt, notExpt } = expectActions[name];

      for (const action of expt) {
        expect(val).toMatch(action);
      }
      for (const action of notExpt) {
        expect(val).toNotMatch(action);
      }
    };

    const checkInstance = async name => {
      const { client } = this.app;

      await selectInstance(client, name);
      const val = await client.element('//div[contains(@class, "actionListRows-")]').getText();
      runExpectActions(name, val);
    };

    it('should have two Redux store instances on Redux DevTools', async () => {
      await checkInstance('Redux store instance 1');
      await checkInstance('Redux store instance 2');
    });

    it('should have two MobX store instances on Redux DevTools', async () => {
      await checkInstance('MobX store instance 1');
      await checkInstance('MobX store instance 2');
    });

    it('should have one RemoteDev store instances on Redux DevTools', async () => {
      await checkInstance('RemoteDev store instance 1');
    });

    it("should haven't any logs in console of main window", async () => {
      const { client } = this.app;
      const logs = await client.getRenderProcessLogs();
      // Print renderer process logs
      logs.forEach(log => {
        console.log('Message:', log.message);
        console.log('Source:', log.source);
        console.log('Level:', log.level);
      });
      expect(logs.length).toEqual(0);
    });
  });
});
