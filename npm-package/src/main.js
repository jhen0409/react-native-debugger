import fs from 'fs';
import cp from 'child_process';
import path from 'path';
import chalk from 'chalk';
import { inject as injectMiddleware, revert as revertMiddleware } from './injectDevToolsMiddleware';

const modulePath = path.join(process.cwd(), 'node_modules');

const log = (pass, msg) => {
  const prefix = pass ? chalk.green.bgBlack('PASS') : chalk.red.bgBlack('FAIL');
  const color = pass ? chalk.blue : chalk.red;
  console.log(prefix, color(msg));
};

export default (argv, cb) => {
  let moduleName;
  if (argv.macos) {
    moduleName = 'react-native-macos';
  } else {
    moduleName = 'react-native';
  }

  // Revert injection
  if (argv.revert) {
    const passMiddleware = revertMiddleware(modulePath, moduleName);
    const msg = 'Revert injection of React Native Debugger from React Native packager';
    log(passMiddleware, msg + (!passMiddleware ? ', the file inject file not found.' : '.'));
    return cb(passMiddleware);
  }

  const inject = () => {
    const pass = injectMiddleware(modulePath, moduleName);
    const msg = 'Replace `open debugger-ui with Chrome` to `open React Native Debugger`';
    log(pass, msg + (pass ? '.' : ', the file inject file not found.'));
    cb(pass);
  };

  if (process.platform !== 'darwin') {
    inject();
  } else {
    const cwd =
      '/System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Versions/A/Support/'; // eslint-disable-line
    const lsregisterPath = 'lsregister';
    if (!fs.existsSync(cwd + lsregisterPath)) return inject();

    cp.exec(`./${lsregisterPath} -dump | grep rndebugger:`, { cwd }, (err, stdout) => {
      if (stdout.length === 0) {
        log(
          false,
          '[RNDebugger] The `rndebugger://` URI scheme seems not registered, ' +
            "maybe you haven't install the app? " +
            'Run `brew update && brew cask install react-native-debugger` ' +
            'or download from https://github.com/jhen0409/react-native-debugger/releases ' +
            'then open it to register the URI scheme.'
        );
      }
      inject();
    });
  }
};
