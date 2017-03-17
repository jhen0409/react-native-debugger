/* eslint-disable no-underscore-dangle */

/*
 * Currently Blob is not supported for RN,
 * we should remove it in WebWorker because it will used for `whatwg-fetch`
 */
if (self.Blob && self.Blob.toString() === 'function Blob() { [native code] }') {
  delete self.Blob;
}

// Avoid warning of use `window.require` on dev mode
const avoidWarnForRequire = (moduleName = 'NativeModules') => new Promise(resolve =>
  setTimeout(() => {
    // It's replaced console.warn of react-native
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (args[0] && args[0].indexOf(`Requiring module '${moduleName}' by name`) > -1) return;
      return originalWarn(...args);
    };
    resolve(() => { console.warn = originalWarn; });
  })
);

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
  window.XMLHttpRequest = window.originalXMLHttpRequest ?
    window.originalXMLHttpRequest :
    window.XMLHttpRequest;
  window.FormData = window.originalFormData ?
    window.originalFormData :
    window.FormData;
};

const methodsGlobalName = '__AVAILABLE_METHODS_CAN_CALL_BY_RNDEBUGGER__';

export const checkAvailableDevMenuMethods = async (enableNetworkInspect = false) => {
  const done = await avoidWarnForRequire();
  const NativeModules = window.__DEV__ ? window.require('NativeModules') : {};
  done();

  // RN 0.43 use DevSettings, DevMenu is deprecated
  const DevSettings = NativeModules.DevSettings || NativeModules.DevMenu;

  let result = ['enableNetworkInspect'];
  const methods = {
    enableNetworkInspect: toggleNetworkInspect,
  };
  if (DevSettings && DevSettings.reload) {
    methods.reload = DevSettings.reload;
    result = ['reload', ...result];
  }
  window[methodsGlobalName] = methods;

  toggleNetworkInspect(enableNetworkInspect);
  postMessage({ [methodsGlobalName]: result });
};

export const invokeDevMenuMethod = (name, args = []) => {
  const method = window[methodsGlobalName][name];
  if (method) method(...args);
};
