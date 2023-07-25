import { ipcMain } from 'electron'
import contextMenu from 'electron-context-menu'
import { readConfig } from './config'
import {
  toggleDevTools, n, item, separator,
} from './menu/common'

const invokeDevMethod = (win, name) => win.webContents.executeJavaScript(
  `window.invokeDevMethod && window.invokeDevMethod('${name}')`,
)

export const registerContextMenu = (win) => {
  const { config } = readConfig()
  const defaultContextMenuItems = [
    item('Toggle Developer Tools', n, () => toggleDevTools(win, 'chrome')),
    item('Toggle React DevTools', n, () => toggleDevTools(win, 'react')),
    item('Toggle Redux DevTools', n, () => toggleDevTools(win, 'redux')),
  ]
  let networkInspectEnabled = !!config.networkInspect
  let availableMethods = []
  contextMenu({
    window: win,
    showInspectElement: process.env.NODE_ENV === 'development',
    prepend: () => [
      availableMethods.includes('reload')
          && item('Reload JS', n, () => invokeDevMethod(win, 'reload')),
      availableMethods.includes('toggleElementInspector')
          && item('Toggle Element Inspector', n, () => invokeDevMethod(win, 'toggleElementInspector')),
      availableMethods.includes('show')
          && item('Show Developer Menu', n, () => invokeDevMethod(win, 'show')),
      item(
        networkInspectEnabled
          ? 'Disable Network Inspect'
          : 'Enable Network Inspect',
        n,
        () => invokeDevMethod(win, 'networkInspect'),
      ),
      availableMethods.includes('showAsyncStorage')
          && item('Log AsyncStorage content', n, () => invokeDevMethod(win, 'showAsyncStorage')),
      availableMethods.includes('clearAsyncStorage')
          && item('Clear AsyncStorage', n, () => invokeDevMethod(win, 'clearAsyncStorage')),
      separator,
    ]
      .filter((menuItem) => !!menuItem)
      .concat(defaultContextMenuItems),
  })

  const listener = (event, data) => {
    availableMethods = data.availableMethods || availableMethods
    networkInspectEnabled = typeof data.networkInspectEnabled === 'boolean'
      ? data.networkInspectEnabled
      : networkInspectEnabled
  }

  ipcMain.on(`context-menu-available-methods-update-${win.id}`, listener)
  return () => {
    ipcMain.off(`context-menu-available-methods-update-${win.id}`, listener)
  }
}
