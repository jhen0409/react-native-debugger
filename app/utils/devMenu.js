import { TouchBar, nativeImage, getCurrentWindow } from '@electron/remote'

import { ipcRenderer } from 'electron'
import config from './config'

const { TouchBarButton, TouchBarSlider } = TouchBar || {}
const currentWindow = getCurrentWindow()

let worker
let availableMethods = []

/* reload, toggleElementInspector, networkInspect */
let leftBar = {}

let isSliderEnabled
let storeLiftedState
/* slider, prev, next */
let rightBar = {}

const getBarItems = (bar) => Object.keys(bar)
  .map((key) => bar[key])
  .filter((barItem) => !!barItem)
const setTouchBar = () => currentWindow.setTouchBar(
  new TouchBar({
    items: [
      ...getBarItems(leftBar),
      ...(isSliderEnabled ? getBarItems(rightBar) : []),
    ],
  }),
)

const invokeDevMenuMethod = ({ name, args }) => worker && worker.postMessage({ method: 'invokeDevMenuMethod', name, args })

let networkInspectEnabled = !!config.networkInspect
const sendContextMenuUpdate = () => {
  ipcRenderer.send(`context-menu-available-methods-update-${currentWindow.id}`, {
    availableMethods,
    networkInspectEnabled,
  })
}

export const networkInspect = {
  isEnabled: () => !!networkInspectEnabled,
  getHighlightColor: () => (networkInspectEnabled ? '#7A7A7A' : '#363636'),
  toggle() {
    networkInspectEnabled = !networkInspectEnabled
    sendContextMenuUpdate()
  },
}

const devMenuMethods = {
  reload: () => invokeDevMenuMethod({ name: 'reload' }),
  toggleElementInspector: () => invokeDevMenuMethod({ name: 'toggleElementInspector' }),
  show: () => invokeDevMenuMethod({ name: 'show' }),
  networkInspect: () => {
    networkInspect.toggle()
    if (leftBar.networkInspect) {
      leftBar.networkInspect.backgroundColor = networkInspect.getHighlightColor()
    }
    invokeDevMenuMethod({
      name: 'networkInspect',
      args: [networkInspectEnabled],
    })
  },
  showAsyncStorage: () => {
    invokeDevMenuMethod({ name: 'showAsyncStorage' })
  },
  clearAsyncStorage: () => {
    if (
      window.confirm(
        'Call `AsyncStorage.clear()` in current React Native debug session?',
      )
    ) {
      invokeDevMenuMethod({ name: 'clearAsyncStorage' })
    }
  },
}

export const invokeDevMethod = (name) => () => {
  if (availableMethods.includes(name)) {
    return devMenuMethods[name]()
  }
}

const hslShift = [0.5, 0.2, 0.8]
const icon = (name, resizeOpts) => {
  const image = nativeImage.createFromNamedImage(name, hslShift)
  return image.resize(resizeOpts)
}

let namedImages
const initNamedImages = () => {
  if (process.platform !== 'darwin' || namedImages) return
  namedImages = {
    reload: icon('NSTouchBarRefreshTemplate', { height: 20 }),
    toggleElementInspector: icon('NSTouchBarQuickLookTemplate', { height: 18 }),
    networkInspect: icon('NSTouchBarRecordStartTemplate', { height: 20 }),
    prev: icon('NSTouchBarGoBackTemplate', { height: 20 }),
    next: icon('NSTouchBarGoForwardTemplate', { height: 20 }),
  }
}

const setDevMenuMethodsForTouchBar = () => {
  if (process.platform !== 'darwin') return
  initNamedImages()

  leftBar = {
    // Default items
    networkInspect: new TouchBarButton({
      icon: namedImages.networkInspect,
      click: devMenuMethods.networkInspect,
      backgroundColor: networkInspect.getHighlightColor(),
    }),
  }
  if (availableMethods.includes('reload')) {
    leftBar.reload = new TouchBarButton({
      icon: namedImages.reload,
      click: devMenuMethods.reload,
    })
  }
  if (availableMethods.includes('toggleElementInspector')) {
    leftBar.toggleElementInspector = new TouchBarButton({
      icon: namedImages.toggleElementInspector,
      click: devMenuMethods.toggleElementInspector,
    })
  }
  setTouchBar()
}

// Reset TouchBar when reload the app
setDevMenuMethodsForTouchBar([])

export const setDevMenuMethods = (list, wkr) => {
  worker = wkr
  availableMethods = list
  sendContextMenuUpdate()
  setDevMenuMethodsForTouchBar()
}

export const setReduxDevToolsMethods = (enabled, dispatch) => {
  if (process.platform !== 'darwin') return
  initNamedImages()

  // Already setup
  if (enabled && isSliderEnabled) return

  const handleSliderChange = (nextIndex, dontUpdateTouchBarSlider = false) => dispatch({
    type: 'JUMP_TO_STATE',
    actionId: storeLiftedState.stagedActionIds[nextIndex],
    index: nextIndex,
    dontUpdateTouchBarSlider,
  })

  rightBar = {
    slider: new TouchBarSlider({
      value: 0,
      minValue: 0,
      maxValue: 0,
      change(nextIndex) {
        if (nextIndex !== storeLiftedState.currentStateIndex) {
          // Set `dontUpdateTouchBarSlider` true for keep slide experience
          handleSliderChange(nextIndex, true)
        }
      },
    }),
    prev: new TouchBarButton({
      icon: namedImages.prev,
      click() {
        const nextIndex = storeLiftedState.currentStateIndex - 1
        if (nextIndex >= 0) {
          handleSliderChange(nextIndex)
        }
      },
    }),
    next: new TouchBarButton({
      icon: namedImages.next,
      click() {
        const nextIndex = storeLiftedState.currentStateIndex + 1
        if (nextIndex < storeLiftedState.computedStates.length) {
          handleSliderChange(nextIndex)
        }
      },
    }),
  }
  isSliderEnabled = enabled
  setTouchBar()
}

export const updateSliderContent = (liftedState, dontUpdateTouchBarSlider) => {
  if (process.platform !== 'darwin') return

  storeLiftedState = liftedState
  if (isSliderEnabled && !dontUpdateTouchBarSlider) {
    const { currentStateIndex, computedStates } = liftedState
    rightBar.slider.maxValue = computedStates.length - 1
    rightBar.slider.value = currentStateIndex
  }
}
