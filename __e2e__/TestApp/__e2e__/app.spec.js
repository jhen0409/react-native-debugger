const delay = time => new Promise(resolve => setTimeout(resolve, time));

describe('Main', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    await delay(500);
  });
  it('should open the article', async () => {
    await expect(element(by.id('home'))).toBeVisible();
  });
});
