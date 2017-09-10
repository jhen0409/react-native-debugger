/* eslint-disable no-underscore-dangle */

const methodGlobalName = '__REPORT_REACT_DEVTOOLS_PORT__';

const reportReactDevToolsPort = (port, platform) =>
  postMessage({
    [methodGlobalName]: port,
    platform,
  });

export const reportDefaultReactDevToolsPort = async ({ setupDevtools, Platform }) => {
  if (Platform.__empty) return;
  /*
   * [Fallback] React Native version under 0.39 can't specified the port
   */
  if (
    typeof setupDevtools === 'function' &&
    setupDevtools.toString().indexOf('window.__REACT_DEVTOOLS_PORT__') === -1
  ) {
    reportReactDevToolsPort(8097, Platform.OS);
  } else {
    // React Inspector will keep the last reported port even if reload JS,
    // because we don't want to icrease the user waiting time for reload JS.
    // We need back to use the random port if we don't need fallback
    reportReactDevToolsPort(window.__REACT_DEVTOOLS_PORT__, Platform.OS);
  }
};
