// Edit from https://github.com/zalmoxisus/remote-redux-devtools/blob/master/src/devTools.js

import instrument from 'redux-devtools-instrument';
import {
  evalAction,
  getActionsArray,
  generateId,
  stringify,
  getSeralizeParameter,
} from 'redux-devtools-core/lib/utils';
import importState from 'redux-devtools-core/lib/utils/importState';
import {
  getLocalFilter,
  isFiltered,
  filterStagedActions,
  filterState,
} from 'redux-devtools-core/lib/utils/filters';

function configureStore(next, subscriber, options) {
  return instrument(subscriber, options)(next);
}

const instances = {
  /* [id]: { name, store, ... } */
};

let lastAction;
let isExcess;
let listenerAdded;
let locked;
let paused;

function getLiftedState(store, filters) {
  return filterStagedActions(store.liftedStore.getState(), filters);
}

function relay(type, state, instance, action, nextActionId) {
  const {
    filters,
    predicate,
    stateSanitizer,
    actionSanitizer,
    serializeState,
    serializeAction,
  } = instance;

  const message = {
    type,
    id: instance.id,
    name: instance.name,
  };
  if (state) {
    message.payload =
      type === 'ERROR'
        ? state
        : stringify(
          filterState(
            state,
            type,
            filters,
            stateSanitizer,
            actionSanitizer,
            nextActionId,
            predicate
          ),
          serializeState
        );
  }
  if (type === 'ACTION') {
    message.action = stringify(
      !actionSanitizer ? action : actionSanitizer(action.action, nextActionId - 1),
      serializeAction
    );
    message.isExcess = isExcess;
    message.nextActionId = nextActionId;
  } else if (instance) {
    message.libConfig = {
      type: 'redux',
      actionCreators: stringify(instance.actionCreators),
      serialize: !!instance.serialize,
    };
  }
  postMessage({ __IS_REDUX_NATIVE_MESSAGE__: true, content: message });
}

function dispatchRemotely(action, instance) {
  try {
    const { store, actionCreators } = instance;
    const result = evalAction(action, actionCreators);
    store.dispatch(result);
  } catch (e) {
    relay('ERROR', e.message, instance);
  }
}

function importPayloadFrom(store, state, instance) {
  try {
    const nextLiftedState = importState(state, instance);
    if (!nextLiftedState) return;
    store.liftedStore.dispatch({ type: 'IMPORT_STATE', ...nextLiftedState });
    relay('STATE', getLiftedState(store, instance.filters), instance);
  } catch (e) {
    relay('ERROR', e.message, instance);
  }
}

function exportState({ id: instanceId, store, serializeState }) {
  const liftedState = store.liftedStore.getState();
  const actionsById = liftedState.actionsById;
  const payload = [];
  liftedState.stagedActionIds.slice(1).forEach(id => {
    payload.push(actionsById[id].action);
  });
  postMessage({
    __IS_REDUX_NATIVE_MESSAGE__: true,
    content: {
      type: 'EXPORT',
      payload: stringify(payload, serializeState),
      committedState:
        typeof liftedState.committedState !== 'undefined'
          ? stringify(liftedState.committedState, serializeState)
          : undefined,
      instanceId,
    },
  });
}

function handleMessages(message) {
  const { id, instanceId, type, action, state, toAll } = message;
  if (toAll) {
    Object.keys(instances).forEach(key => {
      handleMessages({ ...message, id: key, toAll: false });
    });
    return false;
  }

  const instance = instances[id || instanceId];
  if (!instance) return true;
  const { store, filters } = instance;
  if (!store) return false;

  switch (type) {
    case 'DISPATCH':
      store.liftedStore.dispatch(action);
      break;
    case 'ACTION':
      dispatchRemotely(action, instance);
      break;
    case 'IMPORT':
      importPayloadFrom(store, state, instance);
      break;
    case 'EXPORT':
      exportState(instance);
      break;
    case 'UPDATE':
      relay('STATE', getLiftedState(store, filters), instance);
      break;
    default:
      break;
  }
  return false;
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
  const { store, actionCreators, filters } = instance;
  if (typeof actionCreators === 'function') {
    instance.actionCreators = actionCreators();
  }
  relay('STATE', getLiftedState(store, filters), instance);
}

function checkForReducerErrors(liftedState, instance) {
  if (liftedState.computedStates[liftedState.currentStateIndex].error) {
    relay('STATE', filterStagedActions(liftedState, instance.filters), instance);
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

  const { filters, predicate } = instance;
  if (lastAction === 'PERFORM_ACTION') {
    const nextActionId = liftedState.nextActionId;
    const liftedAction = liftedState.actionsById[nextActionId - 1];
    if (isFiltered(liftedAction.action, filters)) return;
    if (predicate && !predicate(state, liftedAction.action)) return;
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
  const {
    name,
    maxAge = 30,
    shouldCatchErrors = !!global.shouldCatchErrors,
    shouldHotReload,
    shouldRecordChanges,
    shouldStartLocked,
    pauseActionType = '@@PAUSED',
    actionCreators,
    filters,
    actionsBlacklist,
    actionsWhitelist,
    actionSanitizer,
    stateSanitizer,
    deserializeState,
    deserializeAction,
    serialize,
    predicate,
  } = options;
  const id = generateId(options.instanceId);

  const serializeState = getSeralizeParameter(options, 'serializeState');
  const serializeAction = getSeralizeParameter(options, 'serializeAction');

  return next => (reducer, initialState) => {
    const store = configureStore(next, monitorReducer, {
      maxAge,
      shouldCatchErrors,
      shouldHotReload,
      shouldRecordChanges,
      shouldStartLocked,
      pauseActionType,
    })(reducer, initialState);

    instances[id] = {
      name: name || id,
      id,
      store,
      filters: getLocalFilter({
        actionsWhitelist: (filters && filters.whitelist) || actionsWhitelist,
        actionsBlacklist: (filters && filters.blacklist) || actionsBlacklist,
      }),
      actionCreators: actionCreators && (() => getActionsArray(actionCreators)),
      stateSanitizer,
      actionSanitizer,
      deserializeState,
      deserializeAction,
      serializeState,
      serializeAction,
      serialize,
      predicate,
    };

    start(instances[id]);
    store.subscribe(() => {
      handleChange(store.getState(), store.liftedStore.getState(), maxAge, instances[id]);
    });
    return store;
  };
}

const preEnhancer = instanceId => next => (reducer, initialState, enhancer) => {
  const store = next(reducer, initialState, enhancer);

  if (instances[instanceId]) {
    instances[instanceId].store = store;
  }
  return {
    ...store,
    dispatch: action => (locked ? action : store.dispatch(action)),
  };
};

devToolsEnhancer.updateStore = (newStore, instanceId) => {
  console.warn(
    '[RNDebugger]',
    '`updateStore` is deprecated use `window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__` instead:',
    'https://github.com/jhen0409/react-native-debugger/blob/master/docs/redux-devtools-integration.md'
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
    (composed, f) => f(composed),
    devToolsEnhancer({ ...options, instanceId })(...args)
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
