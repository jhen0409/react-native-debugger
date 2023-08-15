import path from 'path'
import {
  BrowserWindow, Menu, globalShortcut, dialog,
} from 'electron'
import Store from 'electron-store'
import { enable } from '@electron/remote/main'
import autoUpdate from './update'
import { catchConsoleLogLink, removeUnecessaryTabs, activeTabs } from './devtools'
import { selectRNDebuggerWorkerContext } from '../app/utils/devtools'
import { readConfig, filePath as configFile } from './config'
import { registerContextMenu } from './context-menu'

const store = new Store()

const executeJavaScript = (win, script) => win.webContents.executeJavaScript(script)

export const checkWindowInfo = (win) => executeJavaScript(win, 'window.checkWindowInfo()')

const checkIsOpenInEditorEnabled = (win) => executeJavaScript(win, 'window.isOpenInEditorEnabled()')

const changeMenuItems = (menus) => {
  const rootMenuItems = Menu.getApplicationMenu().items
  Object.entries(menus).forEach(([key, subMenu]) => {
    const rootMenuItem = rootMenuItems.find(({ label }) => label === key)
    if (!rootMenuItem || !rootMenuItem.submenu) return

    Object.entries(subMenu).forEach(([subKey, menuSet]) => {
      const menuItem = rootMenuItem.submenu.items.find(
        ({ label }) => label === subKey,
      )
      if (!menuItem) return

      Object.assign(menuItem, menuSet)
    })
  })
}

const invokeDevMethod = (win, name) => executeJavaScript(
  win,
  `window.invokeDevMethod && window.invokeDevMethod('${name}')`,
)

const registerKeyboradShortcut = (win) => {
  const prefix = process.platform === 'darwin' ? 'Command' : 'Ctrl'
  // If another window focused, register a new shortcut
  if (
    globalShortcut.isRegistered(`${prefix}+R`)
    || globalShortcut.isRegistered(`${prefix}+I`)
  ) {
    globalShortcut.unregisterAll()
  }
  globalShortcut.register(`${prefix}+R`, () => invokeDevMethod(win, 'reload'))
  globalShortcut.register(`${prefix}+I`, () => invokeDevMethod(win, 'toggleElementInspector'))
}

const unregisterKeyboradShortcut = () => globalShortcut.unregisterAll()

const registerShortcuts = async (win) => {
  registerKeyboradShortcut(win)
  changeMenuItems({
    Debugger: {
      'Stay in Front': {
        checked: win.isAlwaysOnTop(),
      },
      'Enable Open in Editor for Console Log': {
        checked: await checkIsOpenInEditorEnabled(win),
      },
    },
  })
}

const minSize = 100
export const createWindow = ({ iconPath, isPortSettingRequired, port }) => {
  const { config, isConfigBroken, error } = readConfig()

  if (isConfigBroken) {
    dialog.showErrorBox(
      'Root config error',
      `Parse root config failed, please checkout \`${configFile}\`, the error trace:\n\n`
        + `${error}\n\n`
        + 'RNDebugger will load default config instead. '
        + 'You can click `Debugger` -> `Open Config File` in application menu.',
    )
  }

  const winBounds = store.get('winBounds') || {}
  const increasePosition = BrowserWindow.getAllWindows().length * 10 || 0
  const {
    width, height, x = 0, y = 0,
  } = winBounds
  const win = new BrowserWindow({
    ...winBounds,
    width: width && width >= minSize ? width : 1024,
    height: height && height >= minSize ? height : 750,
    minWidth: minSize,
    minHeight: minSize,
    x: x + increasePosition,
    y: y + increasePosition,
    backgroundColor: '#272c37',
    tabbingIdentifier: 'rndebugger',
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      // experimentalFeatures: true,
      // webSecurity: false,
      webviewTag: true, // Use this for new inspector in the future
    },
    ...config.windowBounds,
  })
  enable(win.webContents)

  const isFirstWindow = BrowserWindow.getAllWindows().length === 1

  const { timesJSLoadToRefreshDevTools = -1 } = config
  win.debuggerConfig = {
    port,
    editor: config.editor,
    fontFamily: config.fontFamily,
    defaultReactDevToolsTheme: config.defaultReactDevToolsTheme,
    defaultReactDevToolsPort: config.defaultReactDevToolsPort,
    networkInspect: config.defaultNetworkInspect && 1,
    isPortSettingRequired: isPortSettingRequired && 1,
    timesJSLoadToRefreshDevTools,
  }
  win.loadURL(`file://${path.resolve(__dirname)}/app.html?type=debugger`)
  let unregisterContextMenu
  win.webContents.on('did-finish-load', () => {
    win.webContents.zoomLevel = config.zoomLevel || store.get('zoomLevel', 0)
    win.focus()
    unregisterContextMenu = registerContextMenu(win)
    registerShortcuts(win)
    if (!isPortSettingRequired) win.openDevTools()
    const checkUpdate = config.autoUpdate !== false
    if (checkUpdate && isFirstWindow) {
      autoUpdate(iconPath)
    }
  })
  win.webContents.on('devtools-opened', async () => {
    const { location } = await checkWindowInfo(win)
    activeTabs(win)
    catchConsoleLogLink(win, location.host, location.port)
    if (config.showAllDevToolsTab !== true) {
      removeUnecessaryTabs(win)
    }
    selectRNDebuggerWorkerContext(win)
  })
  win.on('show', () => {
    if (!win.isFocused()) return
    registerShortcuts(win)
  })
  win.on('focus', () => registerShortcuts(win))
  win.on('restore', () => registerShortcuts(win))
  win.on('hide', () => unregisterKeyboradShortcut())
  win.on('blur', () => unregisterKeyboradShortcut())
  win.on('minimize', () => unregisterKeyboradShortcut())
  win.close = async () => {
    unregisterKeyboradShortcut()
    store.set('winBounds', win.getBounds())
    store.set('zoomLevel', win.webContents.zoomLevel)
    await executeJavaScript(
      win,
      'window.beforeWindowClose && window.beforeWindowClose()',
    )
    win.destroy()
  }
  win.on('close', (event) => {
    event.preventDefault()
    win.close()
    if (unregisterContextMenu) unregisterContextMenu()
  })
  return win
}
