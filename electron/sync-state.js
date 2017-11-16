import { BrowserWindow } from 'electron';

let syncState = false;

export const isSyncState = () => syncState;

// Take by renderer
global.isSyncState = isSyncState;

export const toggleSyncState = () => {
  syncState = !syncState;
};

export const sendSyncState = (event, payload) => {
  if (!isSyncState) return;

  BrowserWindow.getAllWindows()
    .filter(win => Number(win.webContents.id) !== event.sender.id)
    .forEach(win => {
      win.webContents.send('sync-state', payload);
    });
};
