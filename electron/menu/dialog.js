import { app, dialog, BrowserWindow } from 'electron'
import multiline from 'multiline-template'

const appName = app.name
const detail = multiline`
  | Created by Jhen-Jie Hong
  | (https://github.com/jhen0409)

  | This software includes the following projects:

  | https://github.com/facebook/react-devtools
  | https://github.com/zalmoxisus/remotedev-app
`

export const showAboutDialog = (iconPath) => dialog.showMessageBoxSync({
  title: 'About',
  message: `${appName} ${app.getVersion()}`,
  detail,
  icon: iconPath,
  buttons: [],
})

export const haveOpenedWindow = () => !!BrowserWindow.getAllWindows().length
