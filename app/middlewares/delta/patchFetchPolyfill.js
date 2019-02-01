/*
 * See https://github.com/jhen0409/react-native-debugger/issues/209
 *
 * Patch whatwg-fetch code to get `support` var,
 * so we could use it to fix the issue.
 */

const isFetch = [
  /"node_modules\/@?[a-zA-Z-_/]*whatwg-fetch\/fetch.js"/,
  /*
   * RN >= 0.56
   */
  /,"whatwg-fetch.js"\)/,
  /*
   * RN >= 0.57, it is now in react-native/Libraries/vendor/core/
   */
  /"node_modules\/react-native\/Libraries\/vendor\/core\/whatwg-fetch.js"/,
];

const fetchSupportFlag = /(var support )(=)( {)/g;
const fetchSupportReplaceStr = '$1= self.__FETCH_SUPPORT__ =$3';

const toggleFlag = 'fetch.polyfill = true';
// Toggle Network Inspect after define `support` var.
// We have been set up `__NETWORK_INSPECT__` in Worker before import application script.
const toggleReplaceStr = `${toggleFlag};self.__NETWORK_INSPECT__ && self.__NETWORK_INSPECT__(true)`;

export const checkFetchExists = code => isFetch.some(regex => regex.test(code));
export const patchFetchPolyfill = code => {
  if (Array.isArray(code)) {
    return code.map(item => (typeof item === 'string' ? patchFetchPolyfill(item) : item));
  }
  return code
    .replace(fetchSupportFlag, fetchSupportReplaceStr)
    .replace(toggleFlag, toggleReplaceStr);
};
