import { BrowserWindow } from 'electron';

let syncDevices = false;

// Take by renderer
const isSyncDevices = () => syncDevices;

global.isSyncDevices = isSyncDevices;

export const toggleSyncState = () => {
  syncDevices = !syncDevices;
};

export const sendSyncState = (event, payload) => {
  if (!isSyncDevices) return;

  BrowserWindow.getAllWindows()
    .filter(win => Number(win.webContents.id) !== event.sender.id)
    .forEach(win => {
      win.webContents.send('sync-state', payload);
    });
};
