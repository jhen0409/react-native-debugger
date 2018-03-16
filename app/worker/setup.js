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
  delete self.Blob;
}

replaceForbiddenHeadersForWorkerXHR();
addURIWarningForWorkerFormData();
