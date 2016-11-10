export const SET_DEBUGGER_LOCATION = 'SET_DEBUGGER_LOCATION';
export const SET_DEBUGGER_STATUS = 'SET_DEBUGGER_STATUS';
export const SET_DEBUGGER_WORKER = 'SET_DEBUGGER_WORKER';

export const setDebuggerLocation = loc =>
  ({
    type: SET_DEBUGGER_LOCATION,
    loc,
  });

export const setDebuggerStatus = (status, statusMessage) =>
  ({
    type: SET_DEBUGGER_STATUS,
    status,
    statusMessage,
  });

export const setDebuggerWorker = (worker, status, statusMessage) =>
  ({
    type: SET_DEBUGGER_WORKER,
    worker,
    status,
    statusMessage,
  });
