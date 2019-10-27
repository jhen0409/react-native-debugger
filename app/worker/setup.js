import {
  replaceForbiddenHeadersForWorkerXHR,
  addURIWarningForWorkerFormData,
} from './networkInspect';

// Add the missing `global` for WebWorker
self.global = self;

/*
 * Blob is not supported for RN < 0.54,
 * we should remove it in WebWorker because
 * it will used for `whatwg-fetch` on older RN versions
 */
if (self.Blob && self.Blob.toString() === 'function Blob() { [native code] }') {
  /*
   * RN > 0.54 will polyfill Blob.
   * If it is deleted before the RN setup, RN will not add a reference to the original.
   * We will need to be able to restore the original when running RN > 0.54 for networking tools,
   * so add the reference here as react-native will not do it if the original is deleted
   */
  self.originalBlob = self.Blob;
  delete self.Blob;
}

if (
  self.XMLHttpRequest &&
  self.XMLHttpRequest.toString() === 'function XMLHttpRequest() { [native code] }'
) {
  self.originalXMLHttpRequest = self.XMLHttpRequest;
}

if (self.FormData && self.FormData.toString() === 'function FormData() { [native code] }') {
  self.originalFormData = self.FormData;
}

// Catch native fetch
if (self.fetch && self.fetch.toString() === 'function fetch() { [native code] }') {
  /* eslint-disable-next-line no-underscore-dangle */
  self.__ORIGINAL_FETCH__ = self.fetch;
}

replaceForbiddenHeadersForWorkerXHR();
addURIWarningForWorkerFormData();
