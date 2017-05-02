import qs from 'querystring';
import url from 'url';
import {
  SET_DEBUGGER_STATUS,
  SET_DEBUGGER_WORKER,
  SET_DEBUGGER_LOCATION,
} from '../actions/debugger';

const { isPortSettingRequired } = qs.parse(url.parse(location.href).query);

const refreshShortcut = process.platform === 'darwin' ? '⌘R' : 'Ctrl+R';
const initialState = {
  worker: null,
  status: 'waiting',
  statusMessage: `Waiting, press ${refreshShortcut} in simulator to reload and connect.`,
  location: {
    host: 'localhost',
    port: 8081,
  },
  isPortSettingRequired,
};

function setStatusToTitle(message, port) {
  document.title = `React Native Debugger - ${message} - port: ${port}`;
}

const actionsMap = {
  [SET_DEBUGGER_STATUS]: (state, action) => {
    const newState = {
      ...state,
      status: action.status || initialState.status,
    };
    setStatusToTitle(newState.status, newState.location.port);
    return newState;
  },
  [SET_DEBUGGER_WORKER]: (state, action) => {
    const newState = {
      ...state,
      worker: action.worker,
      status: action.status || initialState.status,
    };
    setStatusToTitle(newState.status, newState.location.port);
    return newState;
  },
  [SET_DEBUGGER_LOCATION]: (state, action) => {
    const newState = {
      ...state,
      location: {
        ...state.location,
        ...action.loc,
      },
      isPortSettingRequired: false,
    };
    setStatusToTitle(newState.status, newState.location.port);
    return newState;
  },
};

export default (state = initialState, action) => {
  const reduceFn = actionsMap[action.type];
  if (!reduceFn) return state;
  return reduceFn(state, action);
};
