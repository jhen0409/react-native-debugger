import { expect as dExpect, element, by, device } from 'detox';
import { delay } from '../../utils';

describe('Main', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    await delay(500);
  });

  it('should open the app', async () => {
    await dExpect(element(by.id('home'))).toBeVisible();
    const title = await rndebugger.browserWindow.getTitle();
    expect(title).toBe('React Native Debugger - Connected (port 8081)');
  });
});
