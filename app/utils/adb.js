import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const androidHome = process.env.ANDROID_HOME || '';
let adbPath = path.join(androidHome, '/platform-tools/adb');
if (!fs.existsSync(adbPath)) {
  adbPath = 'adb';
}

const execAsync = (cmd, opts = {}) => new Promise((resolve, reject) =>
  exec(cmd, opts, (err, result) => {
    if (err) return reject(err);
    resolve(result);
  })
);

const getDevices = async () => {
  const result = (await execAsync(`${adbPath} devices`, { encoding: 'utf-8' }))
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
  return result;
};

const reverse = (device, port) =>
  execAsync(`${adbPath} -s ${device} reverse tcp:${port} tcp:${port}`);

export const tryADBReverse = async port => {
  const devices = await getDevices();
  return Promise.all(devices.map(device => reverse(device, port)));
};
