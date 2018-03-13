import {
  replaceForbiddenHeadersForWorkerXHR,
  addURIWarningForWorkerFormData,
} from './networkInspect';

// Add the missing `global` for WebWorker
self.global = self;

replaceForbiddenHeadersForWorkerXHR();
addURIWarningForWorkerFormData();
