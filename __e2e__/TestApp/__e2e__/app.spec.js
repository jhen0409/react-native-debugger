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

  describe('Context Menu', () => {
    const delay200 = () => delay(200);
    it('should show AsyncStorage content as expected', async () => {
      const { client } = rndebugger;
      await client.execute(() => window.invokeDevMethod('showAsyncStorage')).then(delay200);
      let logs = await client.getRenderProcessLogs();
      // Print renderer process logs
      expect(
        logs.some(log => log.message.indexOf('[RNDebugger] No AsyncStorage content.') > -1)
      ).toBeTruthy();

      await element(by.id('navigate-async-storage'))
        .tap()
        .then(delay200);

      await client.execute(() => window.invokeDevMethod('showAsyncStorage')).then(delay200);
      logs = await client.getRenderProcessLogs();
      expect(logs.some(log => log.message.indexOf('[object Object]') > -1)).toBeTruthy();
    });

    it('should clear AsyncStorage as expected', async () => {
      const { client } = rndebugger;

      await client.execute(() => window.invokeDevMethod('clearAsyncStorage')).then(delay200);
      await client.execute(() => window.invokeDevMethod('showAsyncStorage')).then(delay200);
      const logs = await client.getRenderProcessLogs();
      // Print renderer process logs
      expect(
        logs.some(log => log.message.indexOf('[RNDebugger] No AsyncStorage content.') > -1)
      ).toBeTruthy();
    });
  });
});
