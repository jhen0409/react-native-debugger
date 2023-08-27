import fs from 'fs'
import path from 'path'
import net from 'net'
import http from 'http'
import executablePath from 'electron'
import { _electron as electron } from 'playwright-core'
import waitForExpect from 'wait-for-expect'
import buildTestBundle, { bundlePath } from './buildTestBundle'
import createMockRNServer from './mockRNServer'

const delay = (time) =>
  new Promise((resolve) => {
    setTimeout(resolve, time)
  })

jest.setTimeout(6e4)

describe('Application launch', () => {
  let electronApp
  let mainWindow
  const logs = []

  beforeAll(async () => {
    await buildTestBundle()
    process.env.PACKAGE = 'no'
    electronApp = await electron.launch({
      executablePath,
      args: ['--user-dir=__e2e__/tmp', './main.js'],
      cwd: path.join(__dirname, '../dist'),
    })
    mainWindow = await electronApp.firstWindow()
    mainWindow.on('console', (msg) => logs.push(msg))
    await mainWindow.waitForLoadState()
  })

  afterEach(async () => {
    const state = expect.getState()
    await mainWindow.screenshot({
      path: `./artifacts/${state.currentTestName}.png`,
    })
    const devtoolsWindow = electronApp.windows()[2]
    if (devtoolsWindow) {
      try {
        await delay(100)
        await devtoolsWindow.screenshot({
          path: `./artifacts/devtools:${state.currentTestName}.png`,
        })
      } catch (e) {
        console.error(e)
      }
    }
  })

  afterAll(async () => {
    await electronApp.close()
  })

  it('should show an initial window', async () => {
    expect(await mainWindow.title()).toBe(
      'React Native Debugger - Attempting reconnection (port 8081)',
    )
  })

  it('should portfile (for debugger-open usage) always exists in home dir', async () => {
    const portFile = path.join(
      process.env.USERPROFILE || process.env.HOME,
      '.rndebugger_port',
    )

    expect(fs.existsSync(portFile)).toBe(true)
    fs.unlinkSync(portFile)

    await waitForExpect(async () => {
      expect(fs.existsSync(portFile)).toBeTruthy()
    })
  })

  it("should contain Inspector monitor's component on Redux DevTools", async () => {
    const val = await mainWindow.textContent(
      '//div[contains(@class, "inspector-")]',
    )
    expect(val).not.toBeNull()
  })

  it('should contain an empty actions list on Redux DevTools', async () => {
    const val = await mainWindow.textContent(
      '//div[contains(@class, "actionListRows-")]',
    )
    expect(val).toBe('')
  })

  it('should show waiting message on React DevTools', async () => {
    const el = await mainWindow.locator(
      '//h2[text()="Waiting for React to connect…"]',
    )
    expect(await el.isVisible()).toBe(true)
  })

  const customRNServerPort = 8098
  const getURLFromConnection = (server) =>
    new Promise((resolve) => {
      server.on('connection', (socket, req) => {
        resolve(req.url)
      })
    })

  it('should connect to fake RN server', async () => {
    const { wss, server } = createMockRNServer()

    const url = await getURLFromConnection(wss)
    expect(url).toBe('/debugger-proxy?role=debugger&name=Chrome')

    await waitForExpect(async () => {
      expect(await mainWindow.title()).toBe(
        'React Native Debugger - Waiting for client connection (port 8081)',
      )
    })
    server.close()
    wss.close()
  })

  it('should connect to fake RN server (port 8088) with send set-debugger-loc after', async () => {
    const { wss, server } = createMockRNServer(customRNServerPort)

    const rndPath = `rndebugger://set-debugger-loc?host=localhost&port=${customRNServerPort}`
    const homeEnv = process.platform === 'win32' ? 'USERPROFILE' : 'HOME'
    const portFile = path.join(process.env[homeEnv], '.rndebugger_port')
    const rndPort = fs.readFileSync(portFile, 'utf-8')

    const sendSuccess = await new Promise((resolve) => {
      const socket = net.createConnection(
        { host: '127.0.0.1', port: rndPort },
        () => {
          let pass
          socket.setEncoding('utf-8')
          socket.write(JSON.stringify({ path: rndPath }))
          socket.on('data', (data) => {
            pass = data === 'success'
            socket.end()
          })
          socket.on('end', () => resolve(pass))
          setTimeout(() => socket.end(), 1000)
        },
      )
    })
    expect(sendSuccess).toBe(true)

    const url = await getURLFromConnection(wss)
    expect(url).toBe('/debugger-proxy?role=debugger&name=Chrome')

    await waitForExpect(async () => {
      expect(await mainWindow.title()).toBe(
        `React Native Debugger - Waiting for client connection (port ${customRNServerPort})`,
      )
    })
    server.close()
    wss.close()
  })

  describe('Import fake script after', () => {
    const getOneRequestHeaders = (port) =>
      new Promise((resolve) => {
        const server = http.createServer((req, res) => {
          res.writeHead(200, { 'Content-Type': 'text/plain' })
          res.end('')
          resolve(req.headers)
          server.close()
        })
        server.listen(port)
      })

    let headersPromise
    let server
    let wss
    beforeAll(async () => {
      const info = createMockRNServer(customRNServerPort)
      server = info.server
      wss = info.wss

      headersPromise = getOneRequestHeaders(8099)

      await new Promise((resolve) => {
        wss.on('connection', (socket) => {
          socket.on('message', (message) => {
            const data = JSON.parse(message)
            switch (data.replyID) {
              case 'createJSRuntime':
                socket.send(
                  JSON.stringify({
                    id: 'sendFakeScript',
                    method: 'executeApplicationScript',
                    inject: [],
                    url: `../../${bundlePath}`,
                  }),
                )
                break
              case 'sendFakeScript':
                return resolve()
              default:
                console.error(`Unexperted id ${data.replyID}, data:`, data)
            }
          })
          socket.send(
            JSON.stringify({
              id: 'createJSRuntime',
              method: 'prepareJSRuntime',
            }),
          )
        })
      })
      expect(await mainWindow.title()).toBe(
        `React Native Debugger - Connected (port ${customRNServerPort})`,
      )
    })

    afterAll(() => {
      server.close()
      wss.close()
    })

    it('should received forbidden header names from xhr-test', async () => {
      const headers = await headersPromise

      expect(headers.origin).toBe('custom_origin_here')
      expect(headers['user-agent']).toBe('react-native')
    })

    it('should have @@INIT action on Redux DevTools', async () => {
      const el = await mainWindow
        .locator('div')
        .filter({ hasText: '@@redux/INIT' })
        .first()
      expect(await el.isVisible()).toBeTruthy() // Last store is `RemoteDev store instance 1`
    })

    let currentInstance = 'Autoselect instances' // Default instance
    const wait = () => delay(750)
    const selectInstance = async (instance) => {
      let el = mainWindow.locator(`//div[text()="${currentInstance}"]`)
      expect(await el.isVisible()).toBeTruthy()
      await el.click({ force: true })
      await wait()
      currentInstance = instance
      el = mainWindow.locator(`//div[text()="${instance}"]`)
      expect(await el.isVisible()).toBeTruthy()
      await el.click({ force: true })
      await wait()
    }
    const commit = async () => {
      await mainWindow.click('//button[text()="Commit"]', { force: true })
      await wait()
    }

    const expectActions = {
      'Redux store instance 1': {
        expt: [
          '@@INIT',
          'TEST_PASS_FOR_REDUX_STORE_1',
          'SHOW_FOR_REDUX_STORE_1',
        ],
        notExpt: ['NOT_SHOW_FOR_REDUX_STORE_1', 'TEST_PASS_FOR_REDUX_STORE_2'],
      },
      'Redux store instance 2': {
        expt: ['@@INIT', 'TEST_PASS_FOR_REDUX_STORE_2'],
        notExpt: [
          'TEST_PASS_FOR_REDUX_STORE_1',
          'NOT_SHOW_1_FOR_REDUX_STORE_2',
          'NOT_SHOW_2_FOR_REDUX_STORE_2',
          'NOT_SHOW_3_FOR_REDUX_STORE_2',
        ],
      },
      'MobX store instance 1': {
        expt: ['@@INIT', 'testPassForMobXStore1'],
        notExpt: ['TEST_PASS_FOR_REDUX_STORE_2'],
      },
      'MobX store instance 2': {
        expt: ['@@INIT', 'testPassForMobXStore2'],
        notExpt: ['testPassForMobXStore1'],
      },
      'RemoteDev store instance 1': {
        expt: ['@@redux/INIT', 'TEST_PASS_FOR_REMOTEDEV_STORE_1'],
        notExpt: ['testPassForMobXStore2'],
      },
    }

    const eachAsync = (entries, fn) =>
      entries.reduce(
        (promise, entry, index) => promise.then(() => fn(entry, index)),
        Promise.resolve(),
      )

    const runExpectActions = async (name) => {
      const { expt, notExpt } = expectActions[name]

      await eachAsync(expt, async (action) => {
        const el = await mainWindow
          .locator('div')
          .filter({ hasText: action })
          .first()
        expect(await el.isVisible()).toBeTruthy()
      })

      await eachAsync(notExpt, async (action) => {
        const el = await mainWindow
          .locator('div')
          .filter({ hasText: action })
          .first()
        expect(await el.isVisible()).toBeFalsy()
      })
    }

    const checkInstance = async (name) => {
      await selectInstance(name)
      await runExpectActions(name)
      await commit()
    }

    it('should have two Redux store instances on Redux DevTools', async () => {
      await checkInstance('Redux store instance 1')
      await checkInstance('Redux store instance 2')
    })

    it('should have two MobX store instances on Redux DevTools', async () => {
      await checkInstance('MobX store instance 1')
      await checkInstance('MobX store instance 2')
    })

    it('should have one RemoteDev store instances on Redux DevTools', async () => {
      await checkInstance('RemoteDev store instance 1')
    })

    it('should have only specific logs in console of main window', async () => {
      // Print renderer process logs
      logs.forEach((log) =>
        console.log(`Message: ${log.text()}\nType: ${log.type()}`),
      )
      expect(logs.length).toEqual(3) // clear + clear + warning
      const [, , formDataWarning] = logs
      expect(formDataWarning.type()).toBe('warning')
      expect(
        formDataWarning
          .text()
          .indexOf("Detected you're enabled Network Inspect") > 0,
      ).toBeTruthy()
    })

    it('should show apollo devtools panel', async () => {
      const devtoolsWindow = electronApp.windows()[2]
      expect(
        await devtoolsWindow.evaluate(() =>
          // eslint-disable-next-line no-undef
          Object.keys(UI.panels).some(
            (key) =>
              key.startsWith('chrome-extension://') && key.endsWith('Apollo'),
          ),
        ),
      ).toBeTruthy()
    })
  })
})
