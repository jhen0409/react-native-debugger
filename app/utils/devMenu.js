import { remote } from 'electron';
import contextMenu from 'electron-context-menu';
import { item, n, toggleDevTools, separator } from '../../electron/menu/util';
import config from './config';

const { nativeImage } = remote;
const { TouchBarButton, TouchBarSlider } = remote.TouchBar || {};
const currentWindow = remote.getCurrentWindow();

// eslint-disable-next-line import/no-unresolved
const namedImage = process.platform === 'darwin' ? require('electron-named-image') : {};

let worker;
let availableMethods = [];

/* reload, toggleElementInspector, networkInspect */
let leftBar = {};

let isSliderEnabled;
let storeLiftedState;
/* slider, prev, next */
let rightBar = {};

const getBarItems = bar =>
  Object.keys(bar)
    .map(key => bar[key])
    .filter(barItem => !!barItem);
const setTouchBar = () =>
  currentWindow.setTouchBar([
    ...getBarItems(leftBar),
    ...(isSliderEnabled ? getBarItems(rightBar) : []),
  ]);

const invokeDevMenuMethod = ({ name, args }) =>
  worker && worker.postMessage({ method: 'invokeDevMenuMethod', name, args });

let networkInspectEnabled = !!config.networkInspect;
export const networkInspect = {
  isEnabled: () => !!networkInspectEnabled,
  getHighlightColor: () => (networkInspectEnabled ? '#7A7A7A' : '#363636'),
  toggle() {
    networkInspectEnabled = !networkInspectEnabled;
  },
  label: () => (networkInspectEnabled ? 'Disable Network Inspect' : 'Enable Network Inspect'),
};

const devMenuMethods = {
  reload: () => invokeDevMenuMethod({ name: 'reload' }),
  toggleElementInspector: () => invokeDevMenuMethod({ name: 'toggleElementInspector' }),
  show: () => invokeDevMenuMethod({ name: 'show' }),
  networkInspect: () => {
    networkInspect.toggle();
    if (leftBar.networkInspect) {
      leftBar.networkInspect.backgroundColor = networkInspect.getHighlightColor();
    }
    invokeDevMenuMethod({
      name: 'networkInspect',
      args: [networkInspectEnabled],
    });
  },
  showAsyncStorage: () => {
    invokeDevMenuMethod({ name: 'showAsyncStorage' });
  },
  clearAsyncStorage: () => {
    if (confirm('Call `AsyncStorage.clear()` in current React Native debug session?')) {
      invokeDevMenuMethod({ name: 'clearAsyncStorage' });
    }
  },
};

const defaultContextMenuItems = [
  item('Toggle Developer Tools', n, () => toggleDevTools(currentWindow, 'chrome')),
  item('Toggle React DevTools', n, () => toggleDevTools(currentWindow, 'react')),
  item('Toggle Redux DevTools', n, () => toggleDevTools(currentWindow, 'redux')),
];

contextMenu({
  async: true,
  window: currentWindow,
  showInspectElement: process.env.NODE_ENV === 'development',
  prepend: () =>
    [
      availableMethods.includes('reload') && item('Reload JS', n, devMenuMethods.reload),
      availableMethods.includes('toggleElementInspector') &&
        item('Toggle Element Inspector', n, devMenuMethods.toggleElementInspector),
      availableMethods.includes('show') && item('Show Developer Menu', n, devMenuMethods.show),
      item(networkInspect.label(), n, devMenuMethods.networkInspect),
      availableMethods.includes('showAsyncStorage') &&
        item('Log AsyncStorage content', n, devMenuMethods.showAsyncStorage),
      availableMethods.includes('clearAsyncStorage') &&
        item('Clear AsyncStorage', n, devMenuMethods.clearAsyncStorage),
      separator,
    ]
      .filter(menuItem => !!menuItem)
      .concat(defaultContextMenuItems),
});

export const invokeDevMethod = name => () => {
  if (availableMethods.includes(name)) {
    return devMenuMethods[name]();
  }
};

const icon = name => nativeImage.createFromBuffer(namedImage.getImageNamed(name));

let namedImages;
const initNamedImages = () => {
  if (process.platform !== 'darwin' || namedImages) return;
  namedImages = {
    reload: icon('NSTouchBarRefreshTemplate'),
    toggleElementInspector: icon('NSTouchBarQuickLookTemplate'),
    networkInspect: icon('NSTouchBarRecordStartTemplate'),
    prev: icon('NSTouchBarGoBackTemplate'),
    next: icon('NSTouchBarGoForwardTemplate'),
  };
};

const setDevMenuMethodsForTouchBar = () => {
  if (process.platform !== 'darwin') return;
  initNamedImages();

  leftBar = {
    // Default items
    networkInspect: new TouchBarButton({
      icon: namedImages.networkInspect,
      click: devMenuMethods.networkInspect,
      backgroundColor: networkInspect.getHighlightColor(),
    }),
  };
  if (availableMethods.includes('reload')) {
    leftBar.reload = new TouchBarButton({
      icon: namedImages.reload,
      click: devMenuMethods.reload,
    });
  }
  if (availableMethods.includes('toggleElementInspector')) {
    leftBar.toggleElementInspector = new TouchBarButton({
      icon: namedImages.toggleElementInspector,
      click: devMenuMethods.toggleElementInspector,
    });
  }
  setTouchBar();
};

// Reset TouchBar when reload the app
setDevMenuMethodsForTouchBar([]);

export const setDevMenuMethods = (list, wkr) => {
  worker = wkr;
  availableMethods = list;

  setDevMenuMethodsForTouchBar();
};

export const setReduxDevToolsMethods = (enabled, dispatch) => {
  if (process.platform !== 'darwin') return;
  initNamedImages();

  // Already setup
  if (enabled && isSliderEnabled) return;

  const handleSliderChange = (nextIndex, dontUpdateTouchBarSlider = false) =>
    dispatch({
      type: 'JUMP_TO_STATE',
      actionId: storeLiftedState.stagedActionIds[nextIndex],
      index: nextIndex,
      dontUpdateTouchBarSlider,
    });

  rightBar = {
    slider: new TouchBarSlider({
      value: 0,
      minValue: 0,
      maxValue: 0,
      change(nextIndex) {
        if (nextIndex !== storeLiftedState.currentStateIndex) {
          // Set `dontUpdateTouchBarSlider` true for keep slide experience
          handleSliderChange(nextIndex, true);
        }
      },
    }),
    prev: new TouchBarButton({
      icon: namedImages.prev,
      click() {
        const nextIndex = storeLiftedState.currentStateIndex - 1;
        if (nextIndex >= 0) {
          handleSliderChange(nextIndex);
        }
      },
    }),
    next: new TouchBarButton({
      icon: namedImages.next,
      click() {
        const nextIndex = storeLiftedState.currentStateIndex + 1;
        if (nextIndex < storeLiftedState.computedStates.length) {
          handleSliderChange(nextIndex);
        }
      },
    }),
  };
  isSliderEnabled = enabled;
  setTouchBar();
};

export const updateSliderContent = (liftedState, dontUpdateTouchBarSlider) => {
  if (process.platform !== 'darwin') return;

  storeLiftedState = liftedState;
  if (isSliderEnabled && !dontUpdateTouchBarSlider) {
    const { currentStateIndex, computedStates } = liftedState;
    rightBar.slider.maxValue = computedStates.length - 1;
    rightBar.slider.value = currentStateIndex;
  }
};
