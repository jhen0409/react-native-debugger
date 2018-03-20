/*
 * See https://github.com/jhen0409/react-native-debugger/issues/209
 *
 * Patch whatwg-fetch code to get `support` var,
 * so we could use it to fix the issue.
 */
const isFetch = /"node_modules\/@?[a-zA-Z-_/]*whatwg-fetch\/fetch.js"/;

const fetchSupportFlag = /(if \(self.fetch\) {\n\s+return;\n\s+}\n\s+var support )(=)( {)/g;
const fetchSupportReplaceStr = '$1= self.__FETCH_SUPPORT__ =$3';

const toggleFlag = 'if (support.arrayBuffer) {';
// Toggle Network Inspect after define `support` var.
// We have been set up `__NETWORK_INSPECT__` in Worker before import application script.
const toggleReplaceStr = `self.__NETWORK_INSPECT__ && self.__NETWORK_INSPECT__(true);${toggleFlag}`;

export const checkFetchExists = code => isFetch.test(code);
export const patchFetchPolyfill = code =>
  code.replace(fetchSupportFlag, fetchSupportReplaceStr).replace(toggleFlag, toggleReplaceStr);
