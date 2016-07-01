import fs from 'fs';
import path from 'path';
import watch from 'node-watch';

const homeEnv = process.platform === 'win32' ? 'USERPROFILE' : 'HOME';
const portFile = path.join(process.env[homeEnv], '.rndebugger_port');
let isWatching = false;

export const write = (port) => {
  fs.writeFileSync(portFile, String(port));
};

export const unlink = () => {
  if (fs.existsSync(portFile)) {
    fs.unlinkSync(portFile);
  }
};

export const watchExists = listener => {
  if (isWatching) return;
  isWatching = true;
  watch(portFile, file => {
    if (!fs.existsSync(file)) {
      listener();
    }
  });
};
