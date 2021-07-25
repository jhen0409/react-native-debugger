import path from 'path';
import { session } from 'electron';

export default async () => {
  if (process.env.NODE_ENV === 'development') {
    const installer = require('electron-devtools-installer'); // eslint-disable-line

    const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    for (const name of extensions) {
      try {
        await installer.default(installer[name], {
          forceDownload,
          loadExtensionOptions: { allowFileAccess: true },
        });
      } catch (e) {} // eslint-disable-line
    }
    await session.defaultSession.loadExtension(
      path.resolve('dist/devtools-helper/'),
      { allowFileAccess: true },
    );
    await session.defaultSession.loadExtension(
      path.join(
        __dirname,
        '../node_modules/apollo-client-devtools/shells/webextension/',
      ),
      { allowFileAccess: true },
    );
  } else if (process.env.PACKAGE === 'no') {
    await session.defaultSession.loadExtension(
      path.join(__dirname, 'devtools-helper/'),
      { allowFileAccess: true },
    );
    await session.defaultSession.loadExtension(
      path.join(
        __dirname,
        'node_modules/apollo-client-devtools/shells/webextension/',
      ),
      { allowFileAccess: true },
    );
  } else {
    await session.defaultSession.loadExtension(
      path.join(__dirname, '../devtools-helper/'),
      { allowFileAccess: true },
    );
    await session.defaultSession.loadExtension(
      path.join(
        __dirname,
        '../webextension/',
      ),
      { allowFileAccess: true },
    );
  }
};
