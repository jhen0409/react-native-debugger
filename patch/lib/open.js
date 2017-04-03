'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _opn = require('opn');

var _opn2 = _interopRequireDefault(_opn);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const homeEnv = process.platform === 'win32' ? 'USERPROFILE' : 'HOME';
const portFile = _path2.default.join(process.env[homeEnv], '.rndebugger_port');

function connectToRND(rndPath, log, cb) {
  let port;
  try {
    port = _fs2.default.readFileSync(portFile, 'utf-8');
  } catch (e) {
    if (log) {
      console.log('\n[RNDebugger] The port file `$HOME/.rndebugger_port` not found\n' + 'Maybe the React Native Debugger (^0.3) is not open?\n' + '(Please visit https://github.com/jhen0409/react-native-debugger#installation)\n');
    }
    return cb(false);
  }
  const connection = _net2.default.createConnection({ port: port }, () => {
    let pass = false;
    connection.setEncoding('utf-8');
    connection.write(JSON.stringify({ path: rndPath }));
    connection.on('data', data => {
      pass = data === 'success';
      connection.end();
    });
    const timeoutId = setTimeout(() => {
      if (log) {
        console.log(`\n[RNDebugger] Cannot connect to port ${port}.\n`);
      }
      connection.end();
    }, 1000);
    connection.on('end', () => {
      clearTimeout(timeoutId);
      if (log) {
        console.log('\n[RNDebugger] Try to set port of React Native server failed.\n');
      }
      cb(pass);
    });
  });
}

exports.default = (port, cb) => {
  const rndPath = `rndebugger://set-debugger-loc?host=localhost&port=${port}`;

  if (process.platform === 'darwin') {
    (0, _opn2.default)(rndPath, { wait: false }, err => {
      if (err) {
        connectToRND(rndPath, false, pass => {
          if (!pass) {
            console.log('\n[RNDebugger] Cannot open the app, maybe not install?\n' + '(Please visit https://github.com/jhen0409/react-native-debugger#installation)\n' + 'Or it\'s never started. (Not registered URI Scheme)\n');
          }
          cb(pass, true);
        });
      } else {
        cb(true);
      }
    });
  } else {
    connectToRND(rndPath, true, pass => {
      cb(pass, true);
    });
  }
};