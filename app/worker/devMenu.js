/* eslint-disable no-underscore-dangle */

import { toggleNetworkInspect } from './networkInspect';

let availableDevMenuMethods = {};

export const checkAvailableDevMenuMethods = async (
  { NativeModules, AsyncStorage },
  enableNetworkInspect = false
) => {
  // RN 0.43 use DevSettings, DevMenu will be deprecated
  const DevSettings = NativeModules.DevSettings || NativeModules.DevMenu;
  // Currently `show dev menu` is only on DevMenu
  const showDevMenu =
    (DevSettings && DevSettings.show) ||
    (NativeModules.DevMenu && NativeModules.DevMenu.show) ||
    undefined;

  const methods = {
    ...DevSettings,
    show: showDevMenu,
    networkInspect: toggleNetworkInspect,
    clearAsyncStorage: AsyncStorage.clear ? () => AsyncStorage.clear().catch(f => f) : undefined,
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
