import { app, dialog } from 'electron';
import multiline from 'multiline-template';

const appName = app.getName();
const detail = multiline`
  | Created by Jhen-Jie Hong
  | (https://github.com/jhen0409)

  | This software is included following project:

  | https://github.com/facebook/react-devtools
  | https://github.com/zalmoxisus/remotedev-app
`;

export const showAboutDialog = iconPath =>
  dialog.showMessageBox({
    title: 'About',
    message: `${appName} ${app.getVersion()}`,
    detail,
    icon: iconPath,
    buttons: [],
  });

export const toggleDevTools = (win, type) =>
  win.webContents.send('toggle-devtools', type);

export const menu = (label, submenu) => ({ label, submenu });
export const item = (label, accelerator, click, rest) => ({
  label, accelerator, click, ...rest,
});
export const separator = { type: 'separator' };
export const n = undefined;
