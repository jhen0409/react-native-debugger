${startFlag}
var __opn = require('opn');
var __rndebuggerIsOpening = false;
${replaceFuncFlag}
  var __rnd_path = 'rndebugger://set-debugger-loc?host=localhost&port=' + port;
  function __connectToRND(log, cb) {
    var __home_env = process.platform === 'win32' ? 'USERPROFILE' : 'HOME';
    var __port_file = require('path').join(process.env[__home_env], '.rndebugger_port');
    var __port;
    try {
      __port = require('fs').readFileSync(__port_file, 'utf-8');
    } catch (e) {
      log && console.log(
        '\n[RNDebugger] Cannot find port file $HOME/.rndebugger_port\n' +
        'Maybe you\'re not open React Native Debugger@^0.3?\n' +
        '(Please visit https://github.com/jhen0409/react-native-debugger#installation)\n'
      );
      return cb(false);
    }
    var __c = require('net').createConnection({ port: __port }, () => {
      let pass = false;
      let callbacked = false;
      __c.setEncoding('utf-8');
      __c.write(JSON.stringify({ path: __rnd_path }));
      __c.on('data', data => {
        pass = data === 'success';
        __c.end();
      });
      __c.on('end', () => {
        log && console.log(
          '\n[RNDebugger] Try to set port of React Native server failed.\n'
        );
        cb(pass);
      });
      setTimeout(() => {
        log && console.log(
          '\n[RNDebugger] Cannot connect to port ' + __port + '.\n'
        );
        __c.end();
      }, 1000);
    });
  }
  if (__rndebuggerIsOpening) return;
  __rndebuggerIsOpening = true;
  if (process.platform === 'darwin' && !skipRNDebugger) {
    __opn(__rnd_path, { wait: false }, err => {
      if (err) {
        __connectToRND(false, pass => {
          if (!pass) {
            console.log(
              '\n[RNDebugger] Cannot open the app, maybe not install?\n' +
              '(Please visit https://github.com/jhen0409/react-native-debugger#installation)\n' +
              'Or it\'s never started. (Not registered URI Scheme)\n'
            );
          }
          __rndebuggerIsOpening = false;
          !pass && ${keyFunc}(port, true);
        });
      } else {
        __rndebuggerIsOpening = false;
      }
    });
    return;
  } else if (!skipRNDebugger) {
    __connectToRND(true, pass => {
      __rndebuggerIsOpening = false;
      !pass && ${keyFunc}(port, true);
    });
    return;
  }
  __rndebuggerIsOpening = false;
${endFlag}