import path from 'path';
import { BrowserWindow } from 'electron';

export default async () => {
  if (process.env.NODE_ENV === 'development') {
    const installer = require('electron-devtools-installer'); // eslint-disable-line

    const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    for (const name of extensions) {
      try {
        await installer.default(installer[name], forceDownload);
      } catch (e) {} // eslint-disable-line
    }
    BrowserWindow.addDevToolsExtension(path.resolve('dist/devtools-helper/'));

    BrowserWindow.addDevToolsExtension(path.resolve('../apollo-client-devtools/shells/webextension/'));
  } else {
    BrowserWindow.addDevToolsExtension(path.join(__dirname, 'devtools-helper/'));
  }
};
