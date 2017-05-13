import { remote } from 'electron';
import contextMenu from 'electron-context-menu';
import { item, n, toggleDevTools, separator } from '../../electron/menu/util';

const { TouchBarButton, TouchBarSlider } = remote.TouchBar || {};
const currentWindow = remote.getCurrentWindow();

let worker;
let availableMethods = [];

/* reload, toggleElementInspector, networkInspect */
let leftBar = {};

let isSliderEnabled;
let storeLiftedState;
/* slider, prev, next */
let rightBar = {};

const getBarItems = bar => Object.keys(bar).map(key => bar[key]).filter(barItem => !!barItem);
const setTouchBar = () =>
  currentWindow.setTouchBar([
    ...getBarItems(leftBar),
    ...(isSliderEnabled ? getBarItems(rightBar) : []),
  ]);

const invokeDevMenuMethod = ({ name, args }) =>
  worker && worker.postMessage({ method: 'invokeDevMenuMethod', name, args });

const networkInspect = {
  isEnabled: () => localStorage.networkInspect === 'enabled',
  getHighlightColor: () => (networkInspect.isEnabled() ? '#7A7A7A' : '#363636'),
  toggle() {
    localStorage.networkInspect = networkInspect.isEnabled() ? 'disabled' : 'enabled';
  },
  label: () => (networkInspect.isEnabled() ? 'Disable Network Inspect' : 'Enable Network Inspect'),
};

const devMenuMethods = {
  reload: () => invokeDevMenuMethod({ name: 'reload' }),
  toggleElementInspector: () => invokeDevMenuMethod({ name: 'toggleElementInspector' }),
  networkInspect: () => {
    networkInspect.toggle();
    if (leftBar.networkInspect) {
      leftBar.networkInspect.backgroundColor = networkInspect.getHighlightColor();
    }
    invokeDevMenuMethod({
      name: 'networkInspect',
      args: [networkInspect.isEnabled()],
    });
  },
};

const defaultContextMenuItems = [
  item('Toggle React DevTools', n, () => toggleDevTools(currentWindow, 'react')),
  item('Toggle Redux DevTools', n, () => toggleDevTools(currentWindow, 'redux')),
];

contextMenu({
  window: currentWindow,
  showInspectElement: process.env.NODE_ENV === 'development',
  prepend: () =>
    [
      availableMethods.includes('reload') && item('Reload JS', n, devMenuMethods.reload),
      availableMethods.includes('toggleElementInspector') &&
        item('Toggle Element Inspector', n, devMenuMethods.toggleElementInspector),
      item(networkInspect.label(), n, devMenuMethods.networkInspect, {
        name: 'networkInspect',
      }),
      separator,
    ]
      .filter(menuItem => !!menuItem)
      .concat(defaultContextMenuItems),
});

const setDevMenuMethodsForTouchBar = () => {
  if (process.platform !== 'darwin') return;

  leftBar = {
    reload: availableMethods.includes('reload') &&
      new TouchBarButton(item('Reload JS', n, devMenuMethods.reload)),
    toggleElementInspector: availableMethods.includes('toggleElementInspector') &&
      new TouchBarButton(item('Inspector', n, devMenuMethods.toggleElementInspector)),
    // Default items
    networkInspect: new TouchBarButton(
      item('Network Inspect', n, devMenuMethods.networkInspect, {
        backgroundColor: networkInspect.getHighlightColor(),
      })
    ),
  };
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
      label: 'Prev',
      click() {
        const nextIndex = storeLiftedState.currentStateIndex - 1;
        if (nextIndex >= 0) {
          handleSliderChange(nextIndex);
        }
      },
    }),
    next: new TouchBarButton({
      label: 'Next',
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
