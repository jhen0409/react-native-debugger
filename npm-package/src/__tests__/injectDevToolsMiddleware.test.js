import fs from 'fs-extra';
import path from 'path';
import fetch from 'node-fetch';
import { inject, revert } from '../injectDevToolsMiddleware';

const getRemoteMiddlewarePath = version =>
  `https://raw.githubusercontent.com/facebook/react-native/${version}-stable/local-cli/server/middleware/getDevToolsMiddleware.js`;
const versions = ['0.49', '0.50'];
const modulePath = path.join(__dirname, 'tmp');

const middlewareDir = 'local-cli/server/middleware';
const middlewarePath = path.join(middlewareDir, 'getDevToolsMiddleware.js');

describe('Inject to devtoolsMiddleware of React Native packager', () => {
  afterEach(() => {
    fs.removeSync(path.join(__dirname, 'tmp'));
  });
  versions.forEach(version => {
    test(`inject / revert in react-native ${version}`, async () => {
      const code = await fetch(getRemoteMiddlewarePath(version)).then(res => res.text());
      fs.ensureDirSync(path.join(modulePath, 'react-native', middlewareDir));
      fs.outputFileSync(path.join(modulePath, 'react-native', middlewarePath), code);
      fs.outputFileSync(
        path.join(modulePath, 'react-native', 'package.json'),
        JSON.stringify({
          version: `${version}.0`,
          name: 'react-native',
        })
      );

      expect(code).toMatchSnapshot();
      inject(modulePath, 'react-native');
      expect(
        fs.readFileSync(path.join(modulePath, 'react-native', middlewarePath), 'utf-8')
      ).toMatchSnapshot();
      revert(modulePath, 'react-native');
      expect(
        fs.readFileSync(path.join(modulePath, 'react-native', middlewarePath), 'utf-8')
      ).toMatchSnapshot();
    });
  });

  test('inject / revert in react-native-macos', async () => {
    const code = await fetch(
      'https://raw.githubusercontent.com/ptmt/react-native-macos/merge-0.44.0/local-cli/server/middleware/getDevToolsMiddleware.js'
    ).then(res => res.text());
    fs.ensureDirSync(path.join(modulePath, 'react-native-macos', middlewareDir));
    fs.outputFileSync(path.join(modulePath, 'react-native-macos', middlewarePath), code);
    fs.outputFileSync(
      path.join(modulePath, 'react-native-macos', 'package.json'),
      JSON.stringify({
        version: '0.8.7',
        name: 'react-native-macos',
      })
    );

    expect(code).toMatchSnapshot();
    inject(modulePath, 'react-native-macos');
    expect(
      fs.readFileSync(path.join(modulePath, 'react-native-macos', middlewarePath), 'utf-8')
    ).toMatchSnapshot();
    revert(modulePath, 'react-native-macos');
    expect(
      fs.readFileSync(path.join(modulePath, 'react-native-macos', middlewarePath), 'utf-8')
    ).toMatchSnapshot();
  });

  test('inject / revert in @react-native-commonunity/cli (RN ^0.59.0-rc.0)', async () => {
    const mDir = 'build/commands/server/middleware';
    const mPath = path.join(mDir, 'getDevToolsMiddleware.js');
    const code = await fetch(
      'https://unpkg.com/@react-native-community/cli@1.5.0/build/commands/server/middleware/getDevToolsMiddleware.js'
    ).then(res => res.text());
    fs.ensureDirSync(path.join(modulePath, '@react-native-community/cli', mDir));
    fs.outputFileSync(path.join(modulePath, '@react-native-community/cli', mPath), code);
    fs.outputFileSync(
      path.join(modulePath, 'react-native', 'package.json'),
      JSON.stringify({
        version: '0.59.0-rc.0',
        name: 'react-native',
      })
    );

    expect(code).toMatchSnapshot();
    inject(modulePath, 'react-native');
    expect(
      fs.readFileSync(path.join(modulePath, '@react-native-community/cli', mPath), 'utf-8')
    ).toMatchSnapshot();
    revert(modulePath, 'react-native');
    expect(
      fs.readFileSync(path.join(modulePath, '@react-native-community/cli', mPath), 'utf-8')
    ).toMatchSnapshot();
  });

  test('inject / revert in @react-native-commonunity/cli (RN ^0.60.0)', async () => {
    const mDir = 'build/commands/server/middleware';
    const mPath = path.join(mDir, 'getDevToolsMiddleware.js');
    const code = await fetch(
      'https://unpkg.com/@react-native-community/cli@2.8.3/build/commands/server/middleware/getDevToolsMiddleware.js'
    ).then(res => res.text());
    fs.ensureDirSync(path.join(modulePath, '@react-native-community/cli', mDir));
    fs.outputFileSync(path.join(modulePath, '@react-native-community/cli', mPath), code);
    fs.outputFileSync(
      path.join(modulePath, 'react-native', 'package.json'),
      JSON.stringify({
        version: '0.60.0',
        name: 'react-native',
      })
    );

    expect(code).toMatchSnapshot();
    inject(modulePath, 'react-native');
    expect(
      fs.readFileSync(path.join(modulePath, '@react-native-community/cli', mPath), 'utf-8')
    ).toMatchSnapshot();
    revert(modulePath, 'react-native');
    expect(
      fs.readFileSync(path.join(modulePath, '@react-native-community/cli', mPath), 'utf-8')
    ).toMatchSnapshot();
  });
});
