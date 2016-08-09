'use strict';

const fs = require('fs');
const cp = require('child_process');
const path = require('path');
const chalk = require('chalk');
const injectDevToolsMiddleware = require('./injectDevToolsMiddleware');

const getModulePath = moduleName =>
  path.join(process.cwd(), 'node_modules', moduleName);

const log = (pass, msg) => {
  const prefix = pass ? chalk.green.bgBlack('PASS') : chalk.red.bgBlack('FAIL');
  const color = pass ? chalk.blue : chalk.red;
  console.log(prefix, color(msg));
};

module.exports = (argv, cb) => {
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
    const passMiddleware = injectDevToolsMiddleware.revert(modulePath);
    const msg = 'Revert injection of React Native Debugger from React Native server';
    log(
      passMiddleware,
      msg + (!passMiddleware ? `, the file '${injectDevToolsMiddleware.path}' not found.` : '.')
    );
    return cb(passMiddleware);
  }

  const inject = () => {
    const pass = injectDevToolsMiddleware.inject(modulePath);
    const msg = 'Replace `open debugger-ui with Chrome` to `open React Native Debugger`';
    log(pass, msg + (pass ? '.' : `, the file '${injectDevToolsMiddleware.path}' not found.`));
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
          '[RNDebugger] Cannot find `rndebugger` URI Scheme, ' +
          'maybe not install the app? ' +
          '(Please visit https://github.com/jhen0409/react-native-debugger#installation) ' +
          'Or it\'s never started. (Not registered URI Scheme)'
        );
      }
      inject();
    });
  }
};
