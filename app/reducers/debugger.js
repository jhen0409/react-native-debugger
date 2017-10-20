import {
  SET_DEBUGGER_STATUS,
  SET_DEBUGGER_WORKER,
  SET_DEBUGGER_LOCATION,
} from '../actions/debugger';

const { isPortSettingRequired } = window.query;

function getStatusMessage(status, port) {
  let message;
  switch (status) {
    case 'new':
      message = 'New Window';
      break;
    case 'waiting':
      message = 'Waiting for client connection';
      break;
    case 'connected':
      message = 'Connected';
      break;
    case 'disconnected':
    default:
      message = 'Attempting reconnection';
  }
  if (status !== 'new') {
    message += ` (port ${port})`;
  }
  const title = `React Native Debugger - ${message}`;
  if (title !== document.title) {
    document.title = title;
  }
  return message;
}

const initialState = {
  worker: null,
  status: 'disconnected',
  statusMessage: getStatusMessage(isPortSettingRequired ? 'new' : 'disconnected', 8081),
  location: {
    host: 'localhost',
    port: window.query.port || 8081,
  },
  isPortSettingRequired,
};

const actionsMap = {
  [SET_DEBUGGER_STATUS]: (state, action) => {
    const status = action.status || initialState.status;
    const newState = {
      ...state,
      status,
      statusMessage: getStatusMessage(status, state.location.port),
    };
    return newState;
  },
  [SET_DEBUGGER_WORKER]: (state, action) => {
    const status = action.status || initialState.status;
    const newState = {
      ...state,
      worker: action.worker,
      status,
      statusMessage: getStatusMessage(status, state.location.port),
    };
    return newState;
  },
  [SET_DEBUGGER_LOCATION]: (state, action) => {
    const location = { ...state.location, ...action.loc };
    const newState = {
      ...state,
      location,
      statusMessage: getStatusMessage(state.status, location.port),
      isPortSettingRequired: false,
    };
    return newState;
  },
};

export default (state = initialState, action) => {
  const reduceFn = actionsMap[action.type];
  if (!reduceFn) return state;
  return reduceFn(state, action);
};
