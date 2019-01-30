// Edit from https://github.com/zalmoxisus/remotedev/blob/master/src/devTools.js

import { stringify, parse } from 'jsan';
import { generateId, getActionsArray } from 'redux-devtools-core/lib/utils';

let listenerAdded;
const listeners = {};

export function extractState(message) {
  if (!message || !message.state) return undefined;
  if (typeof message.state === 'string') return parse(message.state);
  return message.state;
}

function handleMessages(message) {
  if (!message.payload) {
    message.payload = message.action;
  }
  const fn = listeners[message.instanceId];
  if (!fn) return true;

  if (typeof fn === 'function') {
    fn(message);
  } else {
    fn.forEach(func => func(message));
  }
  return false;
}

export function start() {
  if (!listenerAdded) {
    self.addEventListener('message', message => {
      const { method, content } = message.data;
      if (method === 'emitReduxMessage') {
        return handleMessages(content);
      }
    });
    listenerAdded = true;
  }
}

function transformAction(action, config) {
  if (action.action) return action;
  const liftedAction = { timestamp: Date.now() };
  if (action) {
    if (config.getActionType) {
      liftedAction.action = config.getActionType(action);
    } else if (typeof action === 'string') {
      liftedAction.action = { type: action };
    } else if (!action.type) {
      liftedAction.action = { type: 'update' };
    } else {
      liftedAction.action = action;
    }
  } else {
    liftedAction.action = { type: action };
  }
  return liftedAction;
}

export function send(action, state, type, options) {
  start();
  setTimeout(() => {
    const message = {
      payload: state ? stringify(state) : '',
      action: type === 'ACTION' ? stringify(transformAction(action, options)) : action,
      type: type || 'ACTION',
      id: options.instanceId,
      instanceId: options.instanceId,
      name: options.name,
    };
    message.libConfig = {
      type: options.type,
      name: options.name,
      serialize: !!options.serialize,
      actionCreators: options.actionCreators,
    };
    postMessage({ __IS_REDUX_NATIVE_MESSAGE__: true, content: message });
  }, 0);
}

export function connect(options = {}) {
  const id = generateId(options.instanceId);
  const opts = {
    ...options,
    instanceId: id,
    name: options.name || id,
    actionCreators: JSON.stringify(getActionsArray(options.actionCreators || {})),
  };
  start();
  return {
    init(state, action) {
      send(action || {}, state, 'INIT', opts);
    },
    subscribe(listener) {
      if (!listener) return undefined;
      if (!listeners[id]) listeners[id] = [];
      listeners[id].push(listener);

      return function unsubscribe() {
        const index = listeners[id].indexOf(listener);
        listeners[id].splice(index, 1);
      };
    },
    unsubscribe() {
      delete listeners[id];
    },
    send(action, payload) {
      if (action) {
        send(action, payload, 'ACTION', opts);
      } else {
        send(undefined, payload, 'STATE', opts);
      }
    },
    error(payload) {
      send(undefined, payload, 'Error', opts);
    },
  };
}
