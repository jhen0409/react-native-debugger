/* global jasmine device */

import childProcess from 'child_process';
import { promisify } from 'util';

/* eslint-disable import/no-unresolved */
const detox = require('detox');
const adapter = require('detox/runners/jest/adapter');
const { detox: config } = require('../package.json');

const exec = promisify(childProcess.exec);

global.simctl = {
  pbcopy: (content, device = 'booted') => exec(`echo '${content}' | xcrun simctl pbcopy ${device}`),
};

jest.setTimeout(120000);
jasmine.getEnv().addReporter(adapter);

beforeAll(async () => {
  await detox.init(config);
});

beforeEach(async () => {
  await adapter.beforeEach();
});

afterAll(async () => {
  await adapter.afterAll();
  await detox.cleanup();
});
