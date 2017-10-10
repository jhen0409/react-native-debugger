import fs from 'fs-extra';
import path from 'path';
import fetch from 'node-fetch';
import {
  dir as middlewareDir,
  path as middlewarePath,
  inject,
  revert,
} from '../injectDevToolsMiddleware';

const getRemoteMiddlewarePath = version =>
  `https://raw.githubusercontent.com/facebook/react-native/${version}-stable/local-cli/server/middleware/getDevToolsMiddleware.js`;
const versions = ['0.49', '0.50'];
const modulePath = path.join(__dirname, 'tmp');

describe('Inject to devtoolsMiddleware of React Native packager', () => {
  afterEach(() => {
    fs.removeSync(path.join(__dirname, 'tmp'));
  });
  versions.forEach(version => {
    test(`inject / revert in RN ${version}`, async () => {
      const code = await fetch(getRemoteMiddlewarePath(version)).then(res => res.text());
      fs.ensureDirSync(path.join(modulePath, middlewareDir));
      fs.outputFileSync(path.join(modulePath, middlewarePath), code);
      fs.outputFileSync(
        path.join(modulePath, 'package.json'),
        JSON.stringify({
          version: `${version}.0`,
          name: 'react-native',
        })
      );

      expect(code).toMatchSnapshot();
      inject(modulePath);
      expect(fs.readFileSync(path.join(modulePath, middlewarePath), 'utf-8')).toMatchSnapshot();
      revert(modulePath);
      expect(fs.readFileSync(path.join(modulePath, middlewarePath), 'utf-8')).toMatchSnapshot();
    });
  });
});
