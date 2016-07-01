${startFlag}
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
        '\nCannot find React Native Debugger port file $HOME/.rndebugger_port\n' +
        'Maybe you\'re not open React Native Debugger?\n' +
        '(Please visit https://github.com/jhen0409/react-native-debugger#installation)\n'
      );
      return cb(false);
    }
    var __c = require('net').createConnection({ port: __port }, () => {
      __c.write(JSON.stringify({ path: __rnd_path }));
      __c.end();
      cb(true);
    });
  }
  if (process.platform === 'darwin' && !skipRNDebugger) {
    if (__rndebuggerIsOpening) return;
    __rndebuggerIsOpening = true;
    opn(__rnd_path, { wait: false }, err => {
      if (err) {
        console.log(
          '\nCannot open React Native Debugger, maybe not install?\n' +
          '(Please visit https://github.com/jhen0409/react-native-debugger#installation)\n' +
          'Or it\'s never started. (Not registered URI Scheme)\n'
        );
        __connectToRND(false, pass =>
          !pass && ${keyFunc}(port, true)
        );
      }
      __rndebuggerIsOpening = false;
    });
    return;
  } else if (!skipRNDebugger) {
    __connectToRND(true, pass =>
      !pass && ${keyFunc}(port, true)
    );
    return;
  }
${endFlag}