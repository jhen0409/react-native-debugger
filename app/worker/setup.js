import {
  replaceForbiddenHeadersForWorkerXHR,
  addURIWarningForWorkerFormData,
} from './networkInspect';

// Add the missing `global` for WebWorker
self.global = self;

/*
 * Currently Blob is not supported for RN,
 * we should remove it in WebWorker because it will used for `whatwg-fetch`
 */
if (self.Blob && self.Blob.toString() === 'function Blob() { [native code] }') {
  delete self.Blob;
}

replaceForbiddenHeadersForWorkerXHR();
addURIWarningForWorkerFormData();
