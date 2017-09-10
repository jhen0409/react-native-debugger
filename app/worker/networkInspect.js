const isWorkerMethod = fn => String(fn).indexOf('[native code]') > -1;

let networkInspect;

export const toggleNetworkInspect = enabled => {
  if (!enabled && networkInspect) {
    window.XMLHttpRequest = networkInspect.XMLHttpRequest;
    window.FormData = networkInspect.FormData;
    networkInspect = null;
    return;
  }
  if (!enabled) return;
  if (isWorkerMethod(window.XMLHttpRequest) || isWorkerMethod(window.FormData)) {
    console.warn(
      '[RNDebugger] ' +
        'I tried to enable Network Inspect but XHR ' +
        "have been replaced by worker's XHR. " +
        'You can disable Network Inspect (documentation: https://goo.gl/f4bjnH) ' +
        'or tracking your app code if you have called ' +
        '`global.XMLHttpRequest = global.originalXMLHttpRequest`.'
    );
    return;
  }
  networkInspect = {
    XMLHttpRequest: window.XMLHttpRequest,
    FormData: window.FormData,
  };
  window.XMLHttpRequest = window.originalXMLHttpRequest
    ? window.originalXMLHttpRequest
    : window.XMLHttpRequest;
  window.FormData = window.originalFormData ? window.originalFormData : window.FormData;

  console.log(
    '[RNDebugger]',
    'Network Inspect is enabled,',
    'see the documentation (https://goo.gl/o3FvdC) for more information.'
  );
};

/*
 * `originalXMLHttpRequest` haven't permission to set forbidden header name
 * (https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name)
 * We have to use Electron session to solve this problem (See electron/main.js)
 */
const forbiddenHeaderNames = [
  'Accept-Charset',
  'Accept-Encoding',
  'Access-Control-Request-Headers',
  'Access-Control-Request-Method',
  'Connection',
  'Content-Length',
  'Cookie',
  'Cookie2',
  'Date',
  'DNT',
  'Expect',
  'Host',
  'Keep-Alive',
  'Origin',
  'Referer',
  'TE',
  'Trailer',
  'Transfer-Encoding',
  'Upgrade',
  'Via',
  // Actually it still blocked on Chrome
  'User-Agent',
];
forbiddenHeaderNames.forEach(name => forbiddenHeaderNames.push(name.toLowerCase()));

const isForbiddenHeaderName = header =>
  forbiddenHeaderNames.includes(header) ||
  header.startsWith('Proxy-') ||
  header.startsWith('proxy-') ||
  header.startsWith('Sec-') ||
  header.startsWith('sec-');

export const replaceForbiddenHeadersForWorkerXHR = () => {
  if (!isWorkerMethod(self.XMLHttpRequest)) return;
  const originalSetRequestHeader = self.XMLHttpRequest.prototype.setRequestHeader;
  self.XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
    let replacedHeader = header;
    if (isForbiddenHeaderName(header)) {
      replacedHeader = `__RN_DEBUGGER_SET_HEADER_REQUEST_${header}`;
    }
    return originalSetRequestHeader.call(this, replacedHeader, value);
  };
};
