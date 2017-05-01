import fs from 'fs';
import cp from 'child_process';
import path from 'path';
import chalk from 'chalk';
import {
  inject as injectMiddleware,
  revert as revertMiddleware,
  path as middlewarePath,
} from './injectDevToolsMiddleware';

const getModulePath = moduleName =>
  path.join(process.cwd(), 'node_modules', moduleName);

const log = (pass, msg) => {
  const prefix = pass ? chalk.green.bgBlack('PASS') : chalk.red.bgBlack('FAIL');
  const color = pass ? chalk.blue : chalk.red;
  console.log(prefix, color(msg));
};

export default (argv, cb) => {
  let modulePath;
  if (argv.macos) {
    modulePath = getModulePath('react-native-macos');
  } else if (argv.desktop) {
    // react-native-macos is renamed from react-native-desktop
    modulePath = getModulePath('react-native-desktop');
    if (!fs.existsSync(modulePath)) {
      modulePath = getModulePath('react-native-macos');
    }
  } else {
    modulePath = getModulePath('react-native');
  }

  // Revert injection
  if (argv.revert) {
    const passMiddleware = revertMiddleware(modulePath);
    const msg = 'Revert injection of React Native Debugger from React Native server';
    log(
      passMiddleware,
      msg + (!passMiddleware ? `, the file '${middlewarePath}' not found.` : '.')
    );
    return cb(passMiddleware);
  }

  const inject = () => {
    const pass = injectMiddleware(modulePath);
    const msg = 'Replace `open debugger-ui with Chrome` to `open React Native Debugger`';
    log(pass, msg + (pass ? '.' : `, the file '${middlewarePath}' not found.`));
    cb(pass);
  };

  if (process.platform !== 'darwin') {
    inject();
  } else {
    const cwd = '/System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Versions/A/Support/'; // eslint-disable-line
    const lsregisterPath = 'lsregister';
    if (!fs.existsSync(cwd + lsregisterPath)) return inject();

    cp.exec(`./${lsregisterPath} -dump | grep rndebugger:`, { cwd }, (err, stdout) => {
      if (stdout.length === 0) {
        log(
          false,
          '[RNDebugger] The `rndebugger://` URI scheme seems not registered, ' +
          'maybe you haven\'t install the app? ' +
          '(Please visit https://github.com/jhen0409/react-native-debugger#installation) ' +
          'Or it\'s never open. (Not registered URI Scheme)'
        );
      }
      inject();
    });
  }
};
