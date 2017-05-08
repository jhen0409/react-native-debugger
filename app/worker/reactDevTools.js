/* eslint-disable no-underscore-dangle */

import { avoidWarnForRequire } from './utils';

const methodGlobalName = '__RESET_REACT_DEVTOOLS_PORT__';

const resetReactDevToolsPort = (port, platform) =>
  postMessage({
    [methodGlobalName]: port,
    platform,
  });

export const setDefaultReactDevToolsPortIfNeeded = async () => {
  const done = await avoidWarnForRequire('setupDevtools', 'Platform');
  const setupDevtools = window.__DEV__ ? window.require('setupDevtools') : undefined;
  const Platform = window.__DEV__ ? window.require('Platform') : {};
  done();
  /*
   * [Fallback] React Native version under 0.39 can't specified the port
   */
  if (
    typeof setupDevtools === 'function' &&
    setupDevtools.toString().indexOf('window.__REACT_DEVTOOLS_PORT__') === -1
  ) {
    resetReactDevToolsPort(8097, Platform.OS);
  }
};
