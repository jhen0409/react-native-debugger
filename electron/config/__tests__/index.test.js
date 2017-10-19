import fs from 'fs';
import path from 'path';
import readConfig from '..';

const testFile = path.join(__dirname, 'config_test');

beforeAll(() => fs.existsSync(testFile) && fs.unlinkSync(testFile));

test('readConfig', () => {
  expect(readConfig(testFile)).toMatchSnapshot();

  // User custom config
  fs.writeFileSync(testFile, '{ autoUpdate: false, }');
  expect(readConfig(testFile)).toMatchSnapshot();

  // Broken config
  fs.writeFileSync(testFile, '{ autoUpdate: is_broken, }');
  expect(readConfig(testFile)).toMatchSnapshot();
});
