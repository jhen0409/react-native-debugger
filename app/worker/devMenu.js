/* eslint-disable no-underscore-dangle */

import { avoidWarnForRequire } from './utils';

let networkInspect;

const toggleNetworkInspect = enabled => {
  if (!enabled && networkInspect) {
    window.XMLHttpRequest = networkInspect.XMLHttpRequest;
    window.FormData = networkInspect.FormData;
    networkInspect = null;
    return;
  }
  if (!enabled) return;
  networkInspect = {
    XMLHttpRequest: window.XMLHttpRequest,
    FormData: window.FormData,
  };
  window.XMLHttpRequest = window.originalXMLHttpRequest
    ? window.originalXMLHttpRequest
    : window.XMLHttpRequest;
  window.FormData = window.originalFormData ? window.originalFormData : window.FormData;

  console.log(
    '[RNDebugger]',
    'Network Inspect is enabled,',
    'you can open `Network` tab to inspect requests of `fetch` and `XMLHttpRequest`.'
  );
};

let availableDevMenuMethods = {};

export const checkAvailableDevMenuMethods = async (enableNetworkInspect = false) => {
  const done = await avoidWarnForRequire('NativeModules', 'AsyncStorage');
  const NativeModules = window.__DEV__ ? window.require('NativeModules') : {};
  const AsyncStorage = window.__DEV__ ? window.require('AsyncStorage') : {};
  done();

  // RN 0.43 use DevSettings, DevMenu is deprecated
  const DevSettings = NativeModules.DevSettings || NativeModules.DevMenu;

  const methods = {
    ...DevSettings,
    networkInspect: toggleNetworkInspect,
    clearAsyncStorage: () => AsyncStorage.clear().catch(f => f),
  };
  const result = Object.keys(methods).filter(key => !!methods[key]);
  availableDevMenuMethods = methods;

  toggleNetworkInspect(enableNetworkInspect);
  postMessage({ __AVAILABLE_METHODS_CAN_CALL_BY_RNDEBUGGER__: result });
};

export const invokeDevMenuMethod = (name, args = []) => {
  const method = availableDevMenuMethods[name];
  if (method) method(...args);
};
