import { app, dialog, shell } from 'electron';
import GhReleases from 'electron-gh-releases';

let checking = false;

export default (icon, notify) => {
  if (checking) {
    console.log('[Updater] Already checking...');
    return;
  }

  checking = true;
  const updater = new GhReleases({
    repo: 'jhen0409/react-native-debugger',
    currentVersion: app.getVersion(),
  });

  updater.check((err, status) => {
    if (process.platform === 'linux' && err.message === 'This platform is not supported.') {
      err = null; // eslint-disable-line
      status = true; // eslint-disable-line
    }
    if (notify && err) {
      dialog.showMessageBox({
        type: 'info',
        buttons: ['OK'],
        title: 'React Native Debugger',
        icon,
        message: err.message,
      });
      console.log('[Updater]', err.message);
      checking = false;
      return;
    }
    if (err || !status) {
      console.log('[Updater] Error', err && err.message, status);
      checking = false;
      return;
    }
    if (notify) {
      const index = dialog.showMessageBox({
        type: 'info',
        buttons: ['Download', 'Later'],
        title: 'React Native Debugger',
        icon,
        message: 'A newer version is available.',
      });
      checking = false;
      if (index === 1) return;
      shell.openExternal('https://github.com/jhen0409/react-native-debugger/releases');
      console.log('[Updater] Open external link.');
      return;
    }
    if (process.env.NODE_ENV === 'production' && process.platform === 'darwin') {
      updater.download();
      console.log('[Updater] Starting download...');
    }
  });
  console.log('[Updater] Checking updates...');

  updater.on('update-downloaded', ([, releaseNotes, releaseName]) => {
    console.log('[Updater] Downloaded.');
    const index = dialog.showMessageBox({
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'React Native Debugger',
      icon,
      message: 'The newer version has been downloaded. ' +
        'Please restart the application to apply the update.',
      detail: `${releaseName}\n\n${releaseNotes}`,
    });
    checking = false;
    if (index === 1) return;
    updater.install();
  });
};
