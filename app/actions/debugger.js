export const SET_DEBUGGER_LOCATION = 'SET_DEBUGGER_LOCATION';
export const SET_DEBUGGER_STATUS = 'SET_DEBUGGER_STATUS';
export const SET_DEBUGGER_WORKER = 'SET_DEBUGGER_WORKER';
export const BEFORE_WINDOW_CLOSE = 'BEFORE_WINDOW_CLOSE';

export const setDebuggerLocation = loc => ({
  type: SET_DEBUGGER_LOCATION,
  loc,
});

export const setDebuggerStatus = status => ({
  type: SET_DEBUGGER_STATUS,
  status,
});

export const setDebuggerWorker = (worker, status) => ({
  type: SET_DEBUGGER_WORKER,
  worker,
  status,
});

export const beforeWindowClose = () => ({
  type: BEFORE_WINDOW_CLOSE,
});
