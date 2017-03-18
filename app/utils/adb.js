import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const androidHome = process.env.ANDROID_HOME || '';
let adbPath = path.join(androidHome, '/platform-tools/adb');
if (!fs.existsSync(adbPath)) {
  adbPath = 'adb';
}

const getDevices = () => {
  let result = [];
  try {
    result = execSync(`${adbPath} devices`, { encoding: 'utf-8' })
      .trim()
      .split(/\r?\n/)
      .map(line => {
        const [id, keyword] = line.split('\t').filter(w => w !== '');
        if (keyword === 'device') {
          return id;
        }
        return null;
      })
      .filter(item => !!item);
  } catch(e) {}  // eslint-disable-line
  return result;
};

const reverse = (device, port) => {
  try {
    execSync(`${adbPath} -s ${device} reverse tcp:${port} tcp:${port}`);
  } catch(e) {}  // eslint-disable-line
};

export const tryADBReverse = port => {
  const devices = getDevices();
  devices.forEach(device => {
    reverse(device, port);
  });
};
