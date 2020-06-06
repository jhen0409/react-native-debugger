import adb from 'adbkit';

export const client = adb.createClient();

const getDevices = () =>
  client.listDevices().filter((device) => device.type === 'device');

client.reverseAll = async (port) => {
  const devices = await getDevices();
  return Promise.all(
    devices.map((device) =>
      client.reverse(device.id, `tcp:${port}`, `tcp:${port}`),
    ),
  );
};

client.shellAll = async (command) => {
  const devices = await getDevices();
  return Promise.all(devices.map((device) => client.shell(device.id, command)));
};

client.openMenuAll = async () => client.shellAll('input keyevent 82');
