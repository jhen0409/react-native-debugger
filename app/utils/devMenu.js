import { remote } from 'electron';
import contextMenu from 'electron-context-menu';
import { item, n, toggleDevTools, separator } from '../../electron/menu/util';

const { TouchBarButton, TouchBarSlider } = remote.TouchBar || {};
const currentWindow = remote.getCurrentWindow();

let worker;

const leftBar = {
  reload: null,
  toggleElementInspector: null,
  networkInspect: null,
};

let sliderEnabled;
let storeLiftedState;
const rightBar = {
  slider: null,
  prev: null,
  next: null,
};

const resetTouchBar = () => {
  const touchBar = [
    ...Object.keys(leftBar).filter(key => !!leftBar[key]).map(key => leftBar[key]),
    ...(sliderEnabled
      ? Object.keys(rightBar).filter(key => !!rightBar[key]).map(key => rightBar[key])
      : []),
  ];
  currentWindow.setTouchBar(touchBar);
};

const invokeDevMenuMethod = ({ name, args }) =>
  worker.postMessage({ method: 'invokeDevMenuMethod', name, args });

const enabledNetworkInspect = () => localStorage.networkInspect === 'enabled';
const getColorForNetworkInspect = () => (enabledNetworkInspect() ? '#7A7A7A' : '#363636');
const toggleNetworkInspect = () => (enabledNetworkInspect() ? 'disabled' : 'enabled');
const getNetworkInspectLabel = enabledNetworkInspect()
  ? 'Disable Network Inspect'
  : 'Enable Network Inspect';

const availableDevMenuMethods = {
  reload: () => invokeDevMenuMethod({ name: 'reload' }),
  toggleElementInspector: () => invokeDevMenuMethod({ name: 'toggleElementInspector' }),
  networkInspect: () => {
    localStorage.networkInspect = toggleNetworkInspect();
    if (leftBar.networkInspect) {
      leftBar.networkInspect.backgroundColor = getColorForNetworkInspect();
    }
    invokeDevMenuMethod({
      name: 'networkInspect',
      args: [enabledNetworkInspect()],
    });
  },
};

const setAvailableDevMenuMethodsForTouchBar = list => {
  if (process.platform !== 'darwin') return;

  leftBar.reload = null;
  leftBar.toggleElementInspector = null;
  leftBar.networkInspect = null;
  if (list.includes('reload')) {
    leftBar.reload = new TouchBarButton({
      label: 'Reload JS',
      click: availableDevMenuMethods.reload,
    });
  }

  if (list.includes('toggleElementInspector')) {
    leftBar.toggleElementInspector = new TouchBarButton({
      label: 'Inspector',
      click: availableDevMenuMethods.toggleElementInspector,
    });
  }

  if (list.includes('networkInspect')) {
    leftBar.networkInspect = new TouchBarButton({
      label: 'Network Inspect',
      backgroundColor: getColorForNetworkInspect(),
      click: availableDevMenuMethods.networkInspect,
    });
  }

  resetTouchBar();
};

const defaultContextMenuItems = [
  item('Toggle React DevTools', n, () => toggleDevTools(currentWindow, 'react')),
  item('Toggle Redux DevTools', n, () => toggleDevTools(currentWindow, 'redux')),
];
let contextMenuItems = [];

contextMenu({
  window: currentWindow,
  showInspectElement: process.env.NODE_ENV === 'development',
  prepend: () => contextMenuItems.concat(defaultContextMenuItems),
});

const setAvailableDevMenuMethodsForContextMenu = list => {
  contextMenuItems = [
    item('Reload JS', n, availableDevMenuMethods.reload, { name: 'reload' }),
    item('Toggle Element Inspector', n, availableDevMenuMethods.toggleElementInspector, {
      name: 'toggleElementInspector',
    }),
    item(getNetworkInspectLabel(), n, availableDevMenuMethods.networkInspect, {
      name: 'networkInspect',
    }),
    separator,
  ].filter(({ name }) => list.includes(name) || !name);
};

export const setAvailableDevMenuMethods = (list, wkr) => {
  worker = wkr;

  setAvailableDevMenuMethodsForTouchBar(list);
  setAvailableDevMenuMethodsForContextMenu(list);
};

export const setReduxDevToolsMethods = (enabled, dispatch) => {
  if (process.platform !== 'darwin') return;

  // Already setup
  if (enabled && sliderEnabled) return;

  const handleSliderChange = (nextIndex, dontUpdateTouchBarSlider = false) =>
    dispatch({
      type: 'JUMP_TO_STATE',
      actionId: storeLiftedState.stagedActionIds[nextIndex],
      index: nextIndex,
      dontUpdateTouchBarSlider,
    });

  rightBar.slider = new TouchBarSlider({
    value: 0,
    minValue: 0,
    maxValue: 0,
    change(nextIndex) {
      if (nextIndex !== storeLiftedState.currentStateIndex) {
        handleSliderChange(nextIndex, true);
      }
    },
  });
  rightBar.prev = new TouchBarButton({
    label: 'Prev',
    click() {
      const nextIndex = storeLiftedState.currentStateIndex - 1;
      if (nextIndex >= 0) {
        handleSliderChange(nextIndex);
      }
    },
  });
  rightBar.next = new TouchBarButton({
    label: 'Next',
    click() {
      const nextIndex = storeLiftedState.currentStateIndex + 1;
      if (nextIndex < storeLiftedState.computedStates.length) {
        handleSliderChange(nextIndex);
      }
    },
  });
  sliderEnabled = enabled;
  resetTouchBar();
};

export const updateSliderContent = (liftedState, dontUpdateTouchBarSlider) => {
  storeLiftedState = liftedState;
  if (sliderEnabled && !dontUpdateTouchBarSlider) {
    const { currentStateIndex, computedStates } = liftedState;
    rightBar.slider.maxValue = computedStates.length - 1;
    rightBar.slider.value = currentStateIndex;
  }
};
