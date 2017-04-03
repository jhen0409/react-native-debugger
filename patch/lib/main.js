'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _injectDevToolsMiddleware = require('./injectDevToolsMiddleware');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getModulePath = moduleName => _path2.default.join(process.cwd(), 'node_modules', moduleName);

const log = (pass, msg) => {
  const prefix = pass ? _chalk2.default.green.bgBlack('PASS') : _chalk2.default.red.bgBlack('FAIL');
  const color = pass ? _chalk2.default.blue : _chalk2.default.red;
  console.log(prefix, color(msg));
};

exports.default = (argv, cb) => {
  let modulePath;
  if (argv.macos) {
    modulePath = getModulePath('react-native-macos');
  } else if (argv.desktop) {
    // react-native-macos is renamed from react-native-desktop
    modulePath = getModulePath('react-native-desktop');
    if (!_fs2.default.existsSync(modulePath)) {
      modulePath = getModulePath('react-native-macos');
    }
  } else {
    modulePath = getModulePath('react-native');
  }

  // Revert injection
  if (argv.revert) {
    const passMiddleware = (0, _injectDevToolsMiddleware.revert)(modulePath);
    const msg = 'Revert injection of React Native Debugger from React Native server';
    log(passMiddleware, msg + (!passMiddleware ? `, the file '${_injectDevToolsMiddleware.path}' not found.` : '.'));
    return cb(passMiddleware);
  }

  const inject = () => {
    const pass = (0, _injectDevToolsMiddleware.inject)(modulePath);
    const msg = 'Replace `open debugger-ui with Chrome` to `open React Native Debugger`';
    log(pass, msg + (pass ? '.' : `, the file '${_injectDevToolsMiddleware.path}' not found.`));
    cb(pass);
  };

  if (process.platform !== 'darwin') {
    inject();
  } else {
    const cwd = '/System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Versions/A/Support/'; // eslint-disable-line
    const lsregisterPath = 'lsregister';
    if (!_fs2.default.existsSync(cwd + lsregisterPath)) return inject();

    _child_process2.default.exec(`./${lsregisterPath} -dump | grep rndebugger:`, { cwd: cwd }, (err, stdout) => {
      if (stdout.length === 0) {
        log(false, '[RNDebugger] The `rndebugger://` URI scheme seems not registered, ' + 'maybe you haven\'t install the app? ' + '(Please visit https://github.com/jhen0409/react-native-debugger#installation) ' + 'Or it\'s never open. (Not registered URI Scheme)');
      }
      inject();
    });
  }
};