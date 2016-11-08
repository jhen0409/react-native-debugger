import { bindActionCreators } from 'redux';
import { UPDATE_STATE, LIFTED_ACTION } from 'remotedev-app/lib/constants/actionTypes';
import { DISCONNECTED } from 'remotedev-app/lib/constants/socketActionTypes';
import { nonReduxDispatch } from 'remotedev-app/lib/utils/monitorActions';
import { showNotification } from 'remotedev-app/lib/actions';
import { getActiveInstance } from 'remotedev-app/lib/reducers/instances';
import { SET_DEBUGGER_WORKER } from '../actions/debugger';

const unboundActions = {
  showNotification,
  updateState: request => ({
    type: UPDATE_STATE,
    request: request.data ? { ...request.data, id: request.id } : request,
  }),
};
let actions;
let worker;
let store;

const toWorker = ({ message, action, state, toAll }) => {
  if (!worker) return;

  const instances = store.getState().instances;
  const instanceId = getActiveInstance(instances);
  const id = instances.options[instanceId].connectionId;
  worker.postMessage({
    method: 'emitReduxMessage',
    content: {
      type: message,
      action,
      state: nonReduxDispatch(store, message, instanceId, action, state, instances),
      instanceId,
      id,
      toAll,
    },
  });
};

// Receive messages from worker
const messaging = message => {
  const { data } = message;
  if (!data || !data.__IS_REDUX_NATIVE_MESSAGE__) return;

  const { content: request } = data;
  if (request.type === 'ERROR') {
    actions.showNotification(request.payload);
    return;
  }
  actions.updateState(request);
};

const initWorker = wkr => {
  wkr.addEventListener('message', messaging);
  worker = wkr;
};

const removeWorker = () => {
  worker = null;
};

export default ({ dispatch }) => {
  actions = bindActionCreators(unboundActions, dispatch);
  return next => action => {
    if (action.type === SET_DEBUGGER_WORKER) {
      if (action.worker) {
        initWorker(action.worker);
      } else {
        removeWorker(action.worker);
        next({ type: DISCONNECTED });
      }
    }
    if (action.type === LIFTED_ACTION) toWorker(action);
    return next(action);
  };
};
