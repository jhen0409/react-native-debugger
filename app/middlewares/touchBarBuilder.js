import { remote } from 'electron';

const { TouchBarButton, TouchBarSlider } = remote.TouchBar || {};
const currentWindow = remote.getCurrentWindow();

let worker;
const leftBar = {
  reload: null,
  enableXHRInspect: null,
};

let sliderEnabled;
let storeLiftedState;
const rightBar = {
  slider: null,
};

const resetTouchBar = () => {
  const touchBar = [
    ...Object.keys(leftBar).filter(key => !!leftBar[key]).map(key => leftBar[key]),
    ...Object.keys(rightBar).filter(key => !!rightBar[key]).map(key => rightBar[key]),
  ];
  currentWindow.setTouchBar(touchBar);
};

const invokeDevMenuMethod = ({ name, args }) =>
  worker.postMessage({ method: 'invokeDevMenuMethod', name, args });

export const setAvailableDevMenuMethods = (list, wkr) => {
  if (process.platform !== 'darwin') return;

  worker = wkr;

  leftBar.reload = null;
  leftBar.enableXHRInspect = null;
  if (list.includes('reload')) {
    leftBar.reload = new TouchBarButton({
      label: 'Reload JS',
      click: () => {
        invokeDevMenuMethod({ name: 'reload' });
      },
    });
  }

  if (list.includes('enableXHRInspect')) {
    const disabled = () => localStorage.enableXHRInspect === 'disabled';
    const getLabel = () => (disabled() ? 'Disable XHR Inspect' : 'Enable XHR Inspect');
    const toggle = () => (disabled() ? 'enabled' : 'disabled');
    leftBar.enableXHRInspect = new TouchBarButton({
      label: getLabel(),
      click: () => {
        localStorage.enableXHRInspect = toggle();
        leftBar.enableXHRInspect.label = getLabel();
        invokeDevMenuMethod({ name: 'enableXHRInspect', args: [localStorage.enableXHRInspect] });
      },
    });
  }

  resetTouchBar();
};

export const setReduxDevToolsMethods = (enabled, dispatch) => {
  if (process.platform !== 'darwin') return;
  if (enabled && sliderEnabled) return;
  sliderEnabled = enabled;
  leftBar.slider = enabled ? new TouchBarSlider({
    value: 0,
    minValue: 0,
    maxValue: 0,
    change: newValue =>
      dispatch({
        type: 'JUMP_TO_STATE',
        actionId: storeLiftedState.stagedActionIds[newValue],
        index: newValue,
        dontUpdateTouchBarSlider: true,
      }),
  }) : null;
  resetTouchBar();
};

export const updateSliderContent = liftedState => {
  storeLiftedState = liftedState;
  const { currentStateIndex, computedStates } = liftedState;
  leftBar.slider.maxValue = computedStates.length - 1;
  leftBar.slider.value = currentStateIndex;
};
