import electronPath from 'electron-prebuilt';
import { Application } from 'spectron';
import expect from 'expect';
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

  describe('should render all DevTools successful', () => {
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
  });
});
