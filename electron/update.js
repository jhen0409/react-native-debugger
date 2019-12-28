import { app, dialog, shell } from 'electron';
import GhReleases from 'electron-gh-releases';
import fetch from 'electron-fetch';

const repo = 'jhen0409/react-native-debugger';

const getFeed = () =>
  fetch(`https://raw.githubusercontent.com/${repo}/master/auto_update.json`).then(res =>
    res.json()
  );

const showDialog = ({ icon, buttons, message, detail }) =>
  dialog.showMessageBoxSync({
    type: 'info',
    buttons,
    title: 'React Native Debugger',
    icon,
    message,
    detail,
  });

const notifyUpdateAvailable = ({ icon, detail }) => {
  const index = showDialog({
    message: 'A newer version is available.',
    buttons: ['Download', 'Later'],
    icon,
    detail,
  });
  return index === 0;
};

const notifyUpdateDownloaded = ({ icon }) => {
  const index = showDialog({
    message:
      'The newer version has been downloaded. ' +
      'Please restart the application to apply the update.',
    buttons: ['Restart', 'Later'],
    icon,
  });
  return index === 0;
};

let checking = false;

export default (icon, notify) => {
  if (checking) return;

  checking = true;
  const updater = new GhReleases({
    repo,
    currentVersion: app.getVersion(),
  });

  updater.check(async (err, status) => {
    if (process.platform === 'linux' && err.message === 'This platform is not supported.') {
      err = null; // eslint-disable-line
      status = true; // eslint-disable-line
    }
    if (notify && err) {
      showDialog({ message: err.message, buttons: ['OK'] });
      checking = false;
      return;
    }
    if (err || !status) {
      checking = false;
      return;
    }
    const feed = await getFeed();
    const detail = `${feed.name}\n\n${feed.notes}`;
    if (notify) {
      const open = notifyUpdateAvailable({ icon, detail });
      if (open) shell.openExternal('https://github.com/jhen0409/react-native-debugger/releases');
    } else if (
      process.env.NODE_ENV === 'production' &&
      process.platform === 'darwin' &&
      notifyUpdateAvailable({ icon, detail })
    ) {
      updater.download();
      console.log('[RNDebugger] Update downloading...');
    }
    checking = false;
  });

  updater.on('update-downloaded', () => {
    console.log('[RNDebugger] Update downloaded');
    if (notifyUpdateDownloaded({ icon })) {
      updater.install();
    }
  });
};
