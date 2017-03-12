import { remote } from 'electron';

const { TouchBarButton, TouchBarSlider } = remote.TouchBar || {};
const currentWindow = remote.getCurrentWindow();

let worker;
const leftBar = {
  reload: null,
  enableNetworkInspect: null,
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
    ...(sliderEnabled ?
      Object.keys(rightBar).filter(key => !!rightBar[key]).map(key => rightBar[key]) :
      []
    ),
  ];
  currentWindow.setTouchBar(touchBar);
};

const invokeDevMenuMethod = ({ name, args }) =>
  worker.postMessage({ method: 'invokeDevMenuMethod', name, args });

export const setAvailableDevMenuMethods = (list, wkr) => {
  if (process.platform !== 'darwin') return;

  worker = wkr;

  leftBar.reload = null;
  leftBar.enableNetworkInspect = null;
  if (list.includes('reload')) {
    leftBar.reload = new TouchBarButton({
      label: 'Reload JS',
      click: () => {
        invokeDevMenuMethod({ name: 'reload' });
      },
    });
  }

  if (list.includes('enableNetworkInspect')) {
    const disabled = () => localStorage.enableNetworkInspect === 'disabled';
    const getLabel = () => (disabled() ? 'Disable Network Inspect' : 'Enable Network Inspect');
    const toggle = () => (disabled() ? 'enabled' : 'disabled');
    leftBar.enableNetworkInspect = new TouchBarButton({
      label: getLabel(),
      click: () => {
        localStorage.enableNetworkInspect = toggle();
        leftBar.enableNetworkInspect.label = getLabel();
        invokeDevMenuMethod({
          name: 'enableNetworkInspect',
          args: [localStorage.enableNetworkInspect],
        });
      },
    });
  }

  resetTouchBar();
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
