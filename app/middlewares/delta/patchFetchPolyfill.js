/*
 * See https://github.com/jhen0409/react-native-debugger/issues/209
 *
 * Patch whatwg-fetch code to get `support` var,
 * so we could use it to fix the issue.
 */
const isFetch = '"node_modules/whatwg-fetch/fetch.js"';
const flag = /if \(self.fetch\) {\n\s+return;\n\s+}\n\s+var support = {/g;
const replaceStr =
  'if (self.fetch) {\n      return;\n    }\n    var support = self._fetchSupport = {';

export default function patchFetchPolyfill(code) {
  if (code.indexOf(isFetch) === -1) {
    return code;
  }
  return code.replace(flag, replaceStr);
}
