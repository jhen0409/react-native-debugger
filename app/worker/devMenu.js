/* eslint-disable no-underscore-dangle */

import { avoidWarnForRequire } from './utils';

const toggleNetworkInspect = enabled => {
  if (!enabled && window.__NETWORK_INSPECT__) {
    window.XMLHttpRequest = window.__NETWORK_INSPECT__.XMLHttpRequest;
    window.FormData = window.__NETWORK_INSPECT__.FormData;
    delete window.__NETWORK_INSPECT__;
    return;
  }
  if (!enabled) return;
  window.__NETWORK_INSPECT__ = {
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

const methodsGlobalName = '__AVAILABLE_METHODS_CAN_CALL_BY_RNDEBUGGER__';

export const checkAvailableDevMenuMethods = async (networkInspect = false) => {
  const done = await avoidWarnForRequire();
  const NativeModules = window.__DEV__ ? window.require('NativeModules') : {};
  done();

  // RN 0.43 use DevSettings, DevMenu is deprecated
  const DevSettings = NativeModules.DevSettings || NativeModules.DevMenu;

  const methods = {
    ...DevSettings,
    networkInspect: toggleNetworkInspect,
  };
  const result = Object.keys(methods).filter(key => !!methods[key]);
  window[methodsGlobalName] = methods;

  toggleNetworkInspect(networkInspect);
  postMessage({ [methodsGlobalName]: result });
};

export const invokeDevMenuMethod = (name, args = []) => {
  const method = window[methodsGlobalName][name];
  if (method) method(...args);
};
