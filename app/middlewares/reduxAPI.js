import { bindActionCreators } from 'redux';
import { remote, ipcRenderer } from 'electron';
import { UPDATE_STATE, LIFTED_ACTION } from 'remotedev-app/lib/constants/actionTypes';
import { DISCONNECTED } from 'remotedev-app/lib/constants/socketActionTypes';
import { nonReduxDispatch } from 'remotedev-app/lib/utils/monitorActions';
import { showNotification, liftedDispatch } from 'remotedev-app/lib/actions';
import { getActiveInstance } from 'remotedev-app/lib/reducers/instances';
import { SET_DEBUGGER_WORKER, SYNC_STATE } from '../actions/debugger';
import { setReduxDevToolsMethods, updateSliderContent } from '../utils/devMenu';

const unboundActions = {
  showNotification,
  updateState: request => ({
    type: UPDATE_STATE,
    request: request.data ? { ...request.data, id: request.id } : request,
  }),
  liftedDispatch,
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

const postImportMessage = state => {
  if (!worker) return;

  const instances = store.getState().instances;
  const instanceId = getActiveInstance(instances);
  const id = instances.options[instanceId].connectionId;
  worker.postMessage({
    method: 'emitReduxMessage',
    content: {
      type: 'IMPORT',
      state,
      instanceId,
      id,
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

const syncLiftedState = liftedState => {
  if (!remote.getGlobal('isSyncState')()) return;

  const actionsById = liftedState.actionsById;
  const payload = [];
  liftedState.stagedActionIds.slice(1).forEach(id => {
    payload.push(actionsById[id].action);
  });
  const serialized = JSON.stringify({ payload: JSON.stringify(payload) });
  ipcRenderer.send('sync-state', serialized);
};

export default inStore => {
  store = inStore;
  actions = bindActionCreators(unboundActions, store.dispatch);
  return next => action => {
    if (action.type === SET_DEBUGGER_WORKER) {
      if (action.worker) {
        initWorker(action.worker);
      } else {
        removeWorker(action.worker);
        setReduxDevToolsMethods(false);
        next({ type: DISCONNECTED });
      }
    }
    if (action.type === LIFTED_ACTION) {
      toWorker(action);
    }
    if (
      action.type === UPDATE_STATE ||
      action.type === LIFTED_ACTION ||
      action.type === SYNC_STATE
    ) {
      next(action);
      const state = store.getState();
      const instances = state.instances;
      const id = getActiveInstance(instances);
      const liftedState = instances.states[id];
      if (liftedState && liftedState.computedStates.length > 1) {
        setReduxDevToolsMethods(true, actions.liftedDispatch);
      } else if (liftedState && liftedState.computedStates.length <= 1) {
        setReduxDevToolsMethods(false);
      }
      updateSliderContent(liftedState, action.action && action.action.dontUpdateTouchBarSlider);
      if (action.request && action.request.type === 'ACTION') {
        syncLiftedState(liftedState);
      }
      if (action.type === SYNC_STATE) {
        postImportMessage(action.payload);
      }
      return;
    }
    return next(action);
  };
};
