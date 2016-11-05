import { app, dialog } from 'electron';
import GhReleases from 'electron-gh-releases';

export default mainWindow => {
  if (process.env.NODE_ENV === 'production' && process.platform === 'darwin') {
    const updater = new GhReleases({
      repo: 'jhen0409/react-native-debugger',
      currentVersion: app.getVersion(),
    });

    updater.check((err, status) => {
      if (err || !status) return;
      updater.download();
    });

    updater.on('update-downloaded', ([, releaseNotes, releaseName]) => {
      const index = dialog.showMessageBox(mainWindow, {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'React Native Debugger',
        message: 'The new version has been downloaded. ' +
          'Please restart the application to apply the updates.',
        detail: `${releaseName}\n\n${releaseNotes}`,
      });
      if (index === 1) return;
      updater.install();
    });
  }
};
