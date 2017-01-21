import { BrowserWindow } from 'electron';

export default async () => {
  if (process.env.NODE_ENV === 'development') {
    const installer = require('electron-devtools-installer'); // eslint-disable-line

    const extensions = [
      'REACT_DEVELOPER_TOOLS',
      'REDUX_DEVTOOLS',
      'egfhcfdfnajldliefpdoaojgahefjhhi', // DevTools Author
    ];
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    for (const name of extensions) {
      try {
        await installer.default(installer[name] || name, forceDownload);
      } catch (e) {} // eslint-disable-line
    }
  } else {
    const name = 'DevTools Author';
    const extension = BrowserWindow.getDevToolsExtensions()[name];
    const { version } = require('./devtools_author/manifest.json'); // eslint-disable-line
    if (extension) {
      if (extension.version === version) return;
      BrowserWindow.removeDevToolsExtension(name);
    }
    BrowserWindow.addDevToolsExtension('devtools_author/');
  }
};
