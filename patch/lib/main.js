const path = require('path');
const chalk = require('chalk');
const injectDevToolsMiddleware = require('./injectDevToolsMiddleware');

const name = 'react-native';

const getModulePath = moduleName =>
  path.join(process.cwd(), 'node_modules', moduleName);

const log = (pass, msg) => {
  const prefix = pass ? chalk.green.bgBlack('PASS') : chalk.red.bgBlack('FAIL');
  const color = pass ? chalk.blue : chalk.red;
  console.log(prefix, color(msg));
};

module.exports = argv => {
  const modulePath = getModulePath(argv.desktop ? 'react-native-desktop' : name);

  // Revert injection
  if (argv.revert) {
    const passMiddleware = injectDevToolsMiddleware.revert(modulePath);
    const msg = 'Revert injection of React Native Debugger from React Native packager';
    log(
      passMiddleware,
      msg + (!passMiddleware ? `, the file '${injectDevToolsMiddleware.path}' not found.` : '.')
    );
    return passMiddleware;
  }

  const pass = injectDevToolsMiddleware.inject(modulePath);
  const msg = 'Replace `open debugger-ui with Chrome` to `open React Native Debugger`';
  log(pass, msg + (pass ? '.' : `, the file '${injectDevToolsMiddleware.path}' not found.`));
  return pass;
};
