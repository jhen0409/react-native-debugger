import { SET_DEBUGGER_STATUS, SET_DEBUGGER_WORKER } from '../actions/debugger';

const initialState = {
  worker: null,
  status: 'waiting',
  statusMessage: 'Waiting, press ⌘R in simulator to reload and connect.',
};

const actionsMap = {
  [SET_DEBUGGER_STATUS]: (state, action) => ({
    ...state,
    status: action.status,
    statusMessage: action.statusMessage,
  }),
  [SET_DEBUGGER_WORKER]: (state, action) => ({
    ...state,
    worker: action.worker,
  }),
};

export default (state = initialState, action) => {
  const reduceFn = actionsMap[action.type];
  if (!reduceFn) return state;
  return reduceFn(state, action);
};
