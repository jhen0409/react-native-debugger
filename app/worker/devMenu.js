/* eslint-disable no-underscore-dangle */

// Avoid warning of use `window.require` on dev mode
const avoidWarnForRequire = (moduleName = 'NativeModules') => new Promise(resolve =>
  setTimeout(() => {
    // It's replaced console.warn of react-native
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (args[0] && args[0].indexOf(`Requiring module '${moduleName}' by name`) >= -1) return;
      return originalWarn(...args);
    };
    resolve(() => { console.warn = originalWarn; });
  })
);

const toggleXHRInspect = enabled => {
  if (!enabled && window.__XHR_INSPECT__) {
    window.XMLHttpRequest = window.__XHR_INSPECT__.XMLHttpRequest;
    window.FormData = window.__XHR_INSPECT__.FormData;
    delete window.__XHR_INSPECT__;
    return;
  }
  if (!enabled) return;
  window.__XHR_INSPECT__ = {
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

export const checkAvailableDevMenuMethods = async (enableXHRInspect = false) => {
  const done = await avoidWarnForRequire();
  const { DevMenu } = window.require('NativeModules');
  done();

  let result = ['enableXHRInspect'];
  window.__AVAILABLE_METHODS_CAN_CALL_BY_RNDEBUGGER__ = {
    enableXHRInspect: toggleXHRInspect,
  };
  if (DevMenu && DevMenu.reload) {
    window.__AVAILABLE_METHODS_CAN_CALL_BY_RNDEBUGGER__.reload = DevMenu.reload;
    result = ['reload', ...result];
  }

  toggleXHRInspect(enableXHRInspect);
  postMessage({ __AVAILABLE_METHODS_CAN_CALL_BY_RNDEBUGGER__: result });
};

export const invokeDevMenuMethod = (name, args = []) => {
  const method = window.__AVAILABLE_METHODS_CAN_CALL_BY_RNDEBUGGER__[name];
  if (method) method(...args);
};
