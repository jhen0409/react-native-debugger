import fs from 'fs';
import path from 'path';

jest.mock('electron', () => ({
  shell: {
    openItem: jest.fn(),
  },
}));

const testFile = path.join(__dirname, 'config_test');

beforeAll(() => fs.existsSync(testFile) && fs.unlinkSync(testFile));

/* eslint-disable global-require */
test('readConfig', () => {
  const { readConfig } = require('..');

  expect(readConfig(testFile)).toMatchSnapshot();

  // User custom config
  fs.writeFileSync(testFile, '{ autoUpdate: false, }');
  expect(readConfig(testFile)).toMatchSnapshot();

  // Broken config
  fs.writeFileSync(testFile, '{ autoUpdate: is_broken, }');
  expect(readConfig(testFile)).toMatchSnapshot();
});

test('openConfigFile', () => {
  const { readConfig, openConfigFile } = require('..');
  const { shell } = require('electron');

  openConfigFile(testFile);
  expect(shell.openItem).toBeCalledWith(testFile);
  shell.openItem.mockClear();

  fs.unlinkSync(testFile);
  openConfigFile(testFile);
  expect(readConfig(testFile)).toMatchSnapshot();
});
