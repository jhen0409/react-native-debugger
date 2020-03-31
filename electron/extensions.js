import path from 'path';
import { BrowserWindow } from 'electron';
import installer, {
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} from 'electron-devtools-installer';

const extensions = ['aamnodipnlopbknpklfoabalmobheehc'];

export default async () => {
  if (process.env.NODE_ENV === 'development') {
    BrowserWindow.addDevToolsExtension(path.resolve('dist/devtools-helper/'));
    BrowserWindow.addDevToolsExtension(
      path.join(
        __dirname,
        '../node_modules/apollo-client-devtools/shells/webextension/',
      ),
    );
    extensions.push(REACT_DEVELOPER_TOOLS);
    extensions.push(REDUX_DEVTOOLS);
  } else {
    BrowserWindow.addDevToolsExtension(
      path.join(__dirname, 'devtools-helper/'),
    );
    BrowserWindow.addDevToolsExtension(
      path.join(
        __dirname,
        'node_modules/apollo-client-devtools/shells/webextension/',
      ),
    );
  }
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  for (const ext of extensions) {
    try {
      await installer(ext, forceDownload);
    } catch (e) {} // eslint-disable-line
  }
};
