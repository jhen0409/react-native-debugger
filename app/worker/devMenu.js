/* eslint-disable no-underscore-dangle */

import { toggleNetworkInspect } from './networkInspect';
import { getClearAsyncStorageFn, getShowAsyncStorageFn, getSafeAsyncStorage } from './asyncStorage';

let availableDevMenuMethods = {};

export const checkAvailableDevMenuMethods = async (
  { NativeModules },
  enableNetworkInspect = false
) => {
  // RN 0.43 use DevSettings, DevMenu will be deprecated
  const DevSettings = NativeModules.DevSettings || NativeModules.DevMenu;
  // Currently `show dev menu` is only on DevMenu
  const showDevMenu =
    (DevSettings && DevSettings.show) ||
    (NativeModules.DevMenu && NativeModules.DevMenu.show) ||
    undefined;

  const AsyncStorage = getSafeAsyncStorage(NativeModules);
  const methods = {
    ...DevSettings,
    show: showDevMenu,
    networkInspect: toggleNetworkInspect,
    showAsyncStorage: getShowAsyncStorageFn(AsyncStorage),
    clearAsyncStorage: getClearAsyncStorageFn(AsyncStorage),
  };
  if (methods.showAsyncStorage) {
    window.showAsyncStorageContentInDev = methods.showAsyncStorage;
  }
  const result = Object.keys(methods).filter(key => !!methods[key]);
  availableDevMenuMethods = methods;

  toggleNetworkInspect(enableNetworkInspect);
  postMessage({ __AVAILABLE_METHODS_CAN_CALL_BY_RNDEBUGGER__: result });
};

export const invokeDevMenuMethodIfAvailable = (name, args = []) => {
  const method = availableDevMenuMethods[name];
  if (method) method(...args);
};
