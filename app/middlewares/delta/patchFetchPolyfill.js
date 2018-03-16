/*
 * See https://github.com/jhen0409/react-native-debugger/issues/209
 *
 * Patch whatwg-fetch code to get `support` var,
 * so we could use it to fix the issue.
 */
const isFetch = '"node_modules/whatwg-fetch/fetch.js"';
const flag = /(if \(self.fetch\) {\n\s+return;\n\s+}\n\s+var support )(=)( {)/g;
const replaceStr = '$1= self._fetchSupport =$3';

export const checkFetchExists = code => code.indexOf(isFetch) > -1;
export const patchFetchPolyfill = code => code.replace(flag, replaceStr);
