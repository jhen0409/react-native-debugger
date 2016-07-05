/* eslint global-require: 0 */
import { app, dialog } from 'electron';

const appName = app.getName();
const detail = `
  Created by Jhen-Jie Hong
  (https://github.com/jhen0409)

  This software is included following project:

  https://github.com/facebook/react-devtools
  https://github.com/zalmoxisus/remotedev-app
`;

export const showAboutDialog = iconPath =>
  dialog.showMessageBox({
    title: 'About',
    message: `${appName} ${app.getVersion()}`,
    detail,
    icon: iconPath,
    buttons: [],
  });

export createContextMenu from './contextMenu';

if (process.platform === 'darwin') {
  exports.createMenuTemplate = require('./darwin').default;
} else {
  exports.createMenuTemplate = require('./linux+win').default;
}
