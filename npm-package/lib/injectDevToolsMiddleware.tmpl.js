${startFlag}
var __fs = require('fs');
var __path = require('path');
var __net = require('net');
var __childProcess = require('child_process');
var __home_env = process.platform === 'win32' ? 'USERPROFILE' : 'HOME';
var __port_file = __path.join(process.env[__home_env], '.rndebugger_port');

function __connectToRND(rndPath, log, cb) {
  var __port;
  try {
    __port = __fs.readFileSync(__port_file, 'utf-8');
  } catch (e) {
    log && console.log(
      '\n[RNDebugger] The port file `$HOME/.rndebugger_port` not found\n' +
      'Maybe the React Native Debugger (^0.3) is not open?\n' +
      '(Please visit https://github.com/jhen0409/react-native-debugger#installation)\n'
    );
    return cb(false);
  }
  var __c = __net.createConnection({ port: __port }, () => {
    let pass = false;
    __c.setEncoding('utf-8');
    __c.write(JSON.stringify({ path: rndPath }));
    __c.on('data', data => {
      pass = data === 'success';
      __c.end();
    });
    const __timeoutId = setTimeout(() => {
      log && console.log(
        '\n[RNDebugger] Cannot connect to port ' + __port + '.\n'
      );
      __c.end();
    }, 1000);
    __c.on('end', () => {
      clearTimeout(__timeoutId);
      !pass && log && console.log(
        '\n[RNDebugger] Try to set port of React Native server failed.\n'
      );
      cb(pass);
    });

  });
}

var __rndebuggerIsOpening = false;
${replaceFuncFlag}
  var __rnd_path = 'rndebugger://set-debugger-loc?host=' + ${args};

  if (__rndebuggerIsOpening) return;
  __rndebuggerIsOpening = true;
  if (process.platform === 'darwin' && !skipRNDebugger) {
    var __env = Object.assign({}, process.env);
    // This env is specified from Expo (and CRNA), we need avoid it included in rndebugger
    delete __env.ELECTRON_RUN_AS_NODE;
    __childProcess
      .spawn('open', ['-g', '-a', 'React Native Debugger', __rnd_path], { env: __env })
      .once('close', code => {
        if (code > 0) {
          __connectToRND(__rnd_path, false, pass => {
            if (!pass) {
              console.log(
                '\n[RNDebugger] Cannot open the app, maybe not install?\n' +
                '(Please visit https://github.com/jhen0409/react-native-debugger#installation)\n' +
                'Or it\'s never started. (Not registered URI Scheme)\n'
              );
            }
            __rndebuggerIsOpening = false;
            !pass && ${keyFunc}${funcCall};
          });
        } else {
          __rndebuggerIsOpening = false;
        }
      })
    return;
  } else if (!skipRNDebugger) {
    __connectToRND(__rnd_path, true, pass => {
      __rndebuggerIsOpening = false;
      !pass && ${keyFunc}${funcCall};
    });
    return;
  }
  __rndebuggerIsOpening = false;
${endFlag}
