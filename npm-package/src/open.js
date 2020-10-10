import fs from 'fs';
import path from 'path';
import net from 'net';
import childProcess from 'child_process';

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
        console.log(`\n[RNDebugger] Cannot connect to server with port ${port}.\n`);
      }
      connection.end();
    }, 1000);
    connection.on('end', () => {
      clearTimeout(timeoutId);
      if (!pass && log) {
        console.log('\n[RNDebugger] Try to set port of React Native packager failed.\n');
      }
      cb(pass);
    });
  });
}

export default ({ port, host = 'localhost' }, cb) => {
  const rndPath = `rndebugger://set-debugger-loc?host=${host}&port=${port}`;

  if (process.platform === 'darwin') {
    const env = Object.assign({}, process.env);
    // This env is specified from Expo (and CRNA), we need avoid it included in rndebugger
    delete env.ELECTRON_RUN_AS_NODE;
    childProcess
      .spawn('open', ['-g', '-a', 'React Native Debugger', rndPath], { env })
      .once('close', code => {
        if (code > 0) {
          connectToRND(rndPath, false, pass => {
            if (!pass) {
              console.log(
                "\n[RNDebugger] Cannot open the app, maybe you haven't install the app?\n" +
                  'Run `brew update && brew cask install react-native-debugger` ' +
                  'or download from https://github.com/jhen0409/react-native-debugger/releases\n'
              );
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
