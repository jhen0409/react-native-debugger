import { expect as dExpect, element, by, device } from 'detox';
import { delay } from '../../utils';

describe('Main', () => {
  beforeEach(async () => {
    const { client } = rndebugger;
    await client.execute(() => (window.confirm = () => true));
    await device.reloadReactNative();
    await delay(500);
  });

  it('should open the app', async () => {
    await dExpect(element(by.id('home'))).toBeVisible();
    const title = await rndebugger.browserWindow.getTitle();
    expect(title).toBe('React Native Debugger - Connected (port 8081)');
  });

  const delay200 = () => delay(200);
  const delay500 = () => delay(500);

  describe('Context Menu', () => {
    it('should show AsyncStorage content as expected', async () => {
      const { client } = rndebugger;
      await client.execute(() => window.invokeDevMethod('showAsyncStorage')).then(delay200);
      let logs = await client.getRenderProcessLogs();
      // Print renderer process logs
      expect(
        logs.some(log => log.message.indexOf('[RNDebugger] No AsyncStorage content.') > -1)
      ).toBeTruthy();

      await element(by.id('navigate-context-menu'))
        .tap()
        .then(delay200);

      await client.execute(() => window.invokeDevMethod('showAsyncStorage')).then(delay200);
      logs = await client.getRenderProcessLogs();
      expect(logs.some(log => log.message.indexOf('[object Object]') > -1)).toBeTruthy();
    });

    it('should clear AsyncStorage as expected', async () => {
      const { client } = rndebugger;

      await element(by.id('navigate-context-menu'))
        .tap()
        .then(delay500);

      await client.execute(() => window.invokeDevMethod('clearAsyncStorage')).then(delay500);
      await client.execute(() => window.invokeDevMethod('showAsyncStorage')).then(delay200);
      const logs = await client.getRenderProcessLogs();
      expect(
        logs.some(log => log.message.indexOf('[RNDebugger] No AsyncStorage content.') > -1)
      ).toBeTruthy();
    });

    it('should send Network request as expected if Network Inspsect enabled', async () => {
      const { client } = rndebugger;

      await element(by.id('navigate-context-menu'))
        .tap()
        .then(delay500);
      await element(by.id('send-request'))
        .tap()
        .then(delay200);

      await client.execute(() => window.invokeDevMethod('networkInspect')).then(delay200);
      const logs = await client.getRenderProcessLogs();
      expect(
        logs.some(
          log =>
            // NOTE: https://github.com/electron/spectron/issues/282
            log.message.indexOf('[RNDebugger]') > -1
        )
      ).toBeTruthy();
    });
  });

  describe('React DevTools', () => {
    const waitingForReactConnect = client =>
      client.waitUntilTextExists(
        '#react-devtools-container > div > div:nth-child(1) > ul > li:nth-child(1)',
        'Elements',
        1000
      );

    it('should connected to React DevTools', async () => {
      const { client } = rndebugger;
      await waitingForReactConnect(client);
    });

    it('should reconnect to React DevTools if open the tab', async () => {
      const { client } = rndebugger;
      await waitingForReactConnect(client);
      await rndebugger.webContents.send('toggle-devtools', 'react').then(delay500);

      const logs = await client.getRenderProcessLogs();
      expect(logs.some(log => log.message.indexOf('closing devtools') > -1)).toBeTruthy();

      await rndebugger.webContents.send('toggle-devtools', 'react').then(() => delay(2000));

      await client.getRenderProcessLogs();
      await waitingForReactConnect(client);
    });
  });
});
