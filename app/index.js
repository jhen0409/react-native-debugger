import { webFrame } from 'electron'
import { getCurrentWindow } from '@electron/remote'
import launchEditor from 'react-dev-utils/launchEditor'
import './setup'
import { invokeDevMethod } from './utils/devMenu'
import { isOpenInEditorEnabled } from './utils/devtools'
import { startLegacyDebugger } from './legacy'

const currentWindow = getCurrentWindow()

webFrame.setZoomFactor(1)
webFrame.setVisualZoomLevelLimits(1, 1)

// Prevent dropped file
document.addEventListener('drop', (e) => {
  e.preventDefault()
  e.stopPropagation()
})
document.addEventListener('dragover', (e) => {
  e.preventDefault()
  e.stopPropagation()
})

startLegacyDebugger()

// For security, we should disable nodeIntegration when user use this open a website
const originWindowOpen = window.open
window.open = (url, frameName, features = '') => {
  const featureList = features.split(',')
  featureList.push('nodeIntegration=0')
  return originWindowOpen.call(window, url, frameName, featureList.join(','))
}

window.openInEditor = (file, lineNumber) => launchEditor(file, lineNumber)
window.isOpenInEditorEnabled = () => isOpenInEditorEnabled(currentWindow)

window.invokeDevMethod = (name) => invokeDevMethod(name)()

// Package will missing /usr/local/bin,
// we need fix it for ensure child process work
// (like launchEditor of react-devtools)
if (
  process.env.NODE_ENV === 'production' &&
  process.platform === 'darwin' &&
  process.env.PATH.indexOf('/usr/local/bin') === -1
) {
  process.env.PATH = `${process.env.PATH}:/usr/local/bin`
}
