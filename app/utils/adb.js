import adb from 'adbkit';

export const client = adb.createClient();

const reverse = (device, port) => client.reverse(device, `tcp:${port}`, `tcp:${port}`);

export const tryADBReverse = async port => {
  const devices = await client.listDevices().filter(device => device.type === 'device');
  return Promise.all(devices.map(device => reverse(device.id, port)));
};
