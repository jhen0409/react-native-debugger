import opn from 'opn';
import fs from 'fs';
import path from 'path';
import net from 'net';

const homeEnv = process.platform === 'win32' ? 'USERPROFILE' : 'HOME';
const portFile = path.join(process.env[homeEnv], '.rndebugger_port');

function connectToRND(rndPath, log, cb) {
  let port;
  try {
    port = fs.readFileSync(portFile, 'utf-8');
  } catch (e) {
    if (log) {
      console.log(
        '\n[RNDebugger] The port file `$HOME/.rndebugger_port` not found\n' +
          'Maybe the React Native Debugger (^0.3) is not open?\n' +
          '(Please visit https://github.com/jhen0409/react-native-debugger#installation)\n'
      );
    }
    return cb(false);
  }
  const connection = net.createConnection({ port }, () => {
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

export default ({ port }, cb) => {
  const rndPath = `rndebugger://set-debugger-loc?host=localhost&port=${port}`;

  if (process.platform === 'darwin') {
    // We need avoid ELECTRON_RUN_AS_NODE env included in rndebugger
    const electronRunAsNode = process.env.ELECTRON_RUN_AS_NODE;
    delete process.env.ELECTRON_RUN_AS_NODE;
    opn(rndPath, { wait: false, app: ['React Native Debugger', '-g'] }, err => {
      if (err) {
        connectToRND(rndPath, false, pass => {
          if (!pass) {
            console.log(
              '\n[RNDebugger] Cannot open the app, maybe not install?\n' +
                '(Please visit https://github.com/jhen0409/react-native-debugger#installation)\n' +
                "Or it's never started. (Not registered URI Scheme)\n"
            );
          }
          cb(pass, true);
        });
      } else {
        cb(true);
      }
    });
    process.env.ELECTRON_RUN_AS_NODE = electronRunAsNode;
  } else {
    connectToRND(rndPath, true, pass => {
      cb(pass, true);
    });
  }
};
