// Edit from https://github.com/zalmoxisus/remote-redux-devtools/blob/master/src/devTools.js

import { stringify, parse } from 'jsan';
import instrument from 'redux-devtools-instrument';
import { evalAction, getActionsArray } from 'remotedev-utils';
import { isFiltered, filterStagedActions, filterState } from 'remotedev-utils/lib/filters';

function configureStore(next, subscriber, options) {
  return instrument(subscriber, options)(next);
}

const instances = { /* id, name, store */ };

let lastAction;
let filters;
let isExcess;
let listenerAdded;
let actionCreators;
let stateSanitizer;
let actionSanitizer;
let locked;
let paused;

function generateId(id) {
  return id || Math.random().toString(36).substr(2);
}

function init(options) {
  if (options.filters) {
    filters = options.filters;
  }
  if (options.actionCreators) {
    actionCreators = () => getActionsArray(options.actionCreators);
  }
  stateSanitizer = options.stateSanitizer;
  actionSanitizer = options.actionSanitizer;
}

function getLiftedState(store) {
  return filterStagedActions(store.liftedStore.getState());
}

function relay(type, state, instance, action, nextActionId) {
  if (filters && isFiltered(action)) return;
  const message = {
    type,
    id: instance.id,
    name: instance.name,
  };
  if (state) {
    message.payload = type === 'ERROR' ?
      state :
      stringify(filterState(state, type, filters, stateSanitizer, actionSanitizer, nextActionId));
  }
  if (type === 'ACTION') {
    message.action = stringify(
      !actionSanitizer ? action : actionSanitizer(action.action, nextActionId - 1)
    );
    message.isExcess = isExcess;
    message.nextActionId = nextActionId;
  } else if (action) {
    message.action = stringify(action);
  }
  postMessage({ __IS_REDUX_NATIVE_MESSAGE__: true, content: message });
}

function dispatchRemotely(action, id) {
  try {
    const result = evalAction(action, actionCreators);
    const { store } = instances[id];
    store.dispatch(result);
  } catch (e) {
    relay('ERROR', e.message, instances[id]);
  }
}

function handleMessages(message) {
  const { id, instanceId, type, action, state } = message;
  const { store } = instances[id || instanceId];
  if (type === 'IMPORT') {
    store.liftedStore.dispatch({
      type: 'IMPORT_STATE',
      nextLiftedState: parse(state),
    });
  }
  if (type === 'UPDATE' || type === 'IMPORT') {
    relay('STATE', getLiftedState(store), instances[id]);
  }
  if (type === 'ACTION') {
    dispatchRemotely(action, id);
  } else if (type === 'DISPATCH') {
    store.liftedStore.dispatch(action);
  }
}

function start(instance) {
  if (!listenerAdded) {
    self.addEventListener('message', message => {
      const { method, content } = message.data;
      if (method === 'emitReduxMessage') {
        handleMessages(content);
      }
    });
    listenerAdded = true;
  }

  if (typeof actionCreators === 'function') actionCreators = actionCreators();
  relay('STATE', getLiftedState(instance.store), instance, actionCreators);
}

function checkForReducerErrors(liftedState, instance) {
  if (liftedState.computedStates[liftedState.currentStateIndex].error) {
    relay('STATE', filterStagedActions(liftedState, filters), instance);
    return true;
  }
  return false;
}

function monitorReducer(state = {}, action) {
  lastAction = action.type;
  return state;
}

function handleChange(state, liftedState, maxAge, instance) {
  if (checkForReducerErrors(liftedState, instance)) return;

  if (lastAction === 'PERFORM_ACTION') {
    const nextActionId = liftedState.nextActionId;
    const liftedAction = liftedState.actionsById[nextActionId - 1];
    relay('ACTION', state, instance, liftedAction, nextActionId);
    if (!isExcess && maxAge) isExcess = liftedState.stagedActionIds.length >= maxAge;
  } else {
    if (lastAction === 'JUMP_TO_STATE') return;
    if (lastAction === 'PAUSE_RECORDING') {
      paused = liftedState.isPaused;
    } else if (lastAction === 'LOCK_CHANGES') {
      locked = liftedState.isLocked;
    }
    if (paused || locked) {
      if (lastAction) lastAction = undefined;
      else return;
    }
    relay('STATE', filterStagedActions(liftedState, filters), instance);
  }
}

export default function devToolsEnhancer(options = {}) {
  init(options);

  const defaultName = global.require ? global.require('Platform').OS : 'default';
  const {
    name,
    maxAge = 30,
    shouldHotReload,
    shouldRecordChanges,
    shouldStartLocked,
  } = options;
  const id = generateId(options.instanceId);

  return next => (reducer, initialState) => {
    const store = configureStore(
      next, monitorReducer, {
        maxAge,
        shouldHotReload,
        shouldRecordChanges,
        shouldStartLocked,
      }
    )(reducer, initialState);

    instances[id] = {
      name: name || `${defaultName}-${id}`,
      id,
      store,
    };

    start(instances[id]);
    store.subscribe(() => {
      handleChange(store.getState(), store.liftedStore.getState(), maxAge, instances[id]);
    });
    return store;
  };
}

const preEnhancer = instanceId => next =>
  (reducer, initialState, enhancer) => {
    const store = next(reducer, initialState, enhancer);

    if (instances[instanceId]) {
      instances[instanceId].store = store;
    }
    return {
      ...store,
      dispatch: (action) => (
        locked ? action : store.dispatch(action)
      ),
    };
  };

devToolsEnhancer.updateStore = (newStore, instanceId) => {
  console.warn(
    '`reduxNativeDevTools.updateStore` is deprecated use `reduxNativeDevToolsCompose` instead:',
    'https://github.com/jhen0409/react-native-debugger#advanced-store-setup'
  );

  const keys = Object.keys(instances);
  if (!keys.length) return;

  if (keys.length > 1 && !instanceId) {
    console.warn(
      'You have multiple stores,',
      'please provide `instanceId` argument (`updateStore(store, instanceId)`)'
    );
  }
  if (instanceId) {
    const instance = instances[instanceId];
    if (!instance) return;
    instance.store = newStore;
  } else {
    instances[keys[0]].store = newStore;
  }
};

const compose = options => (...funcs) => (...args) => {
  const instanceId = generateId(options.instanceId);
  return [preEnhancer(instanceId), ...funcs].reduceRight(
    (composed, f) => f(composed), devToolsEnhancer({ ...options, instanceId })(...args)
  );
};

export function composeWithDevTools(...funcs) {
  if (funcs.length === 0) {
    return devToolsEnhancer();
  }
  if (funcs.length === 1 && typeof funcs[0] === 'object') {
    return compose(funcs[0]);
  }
  return compose({})(...funcs);
}
