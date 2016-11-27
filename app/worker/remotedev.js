// Edit from https://github.com/zalmoxisus/remotedev/blob/master/src/devTools.js

import { stringify, parse } from 'jsan';
import { generateId } from 'remotedev-utils';

let listenerAdded;
const listeners = {};

export function extractState(message) {
  return message.state ? parse(message.state) : undefined;
}

function handleMessages(message) {
  if (!message.payload) message.payload = message.action;
  Object.keys(listeners).forEach(id => {
    if (message.instanceId && id !== message.instanceId) return;
    if (typeof listeners[id] === 'function') listeners[id](message);
    else listeners[id].forEach(fn => { fn(message); });
  });
}

export function start() {
  if (!listenerAdded) {
    self.addEventListener('message', message => {
      const { method, content } = message.data;
      if (method === 'emitReduxMessage') {
        handleMessages(content);
      }
    });
    listenerAdded = true;
  }
}

function transformAction(action) {
  if (action.action) return action;
  const liftedAction = { timestamp: Date.now() };
  if (typeof action === 'object') {
    liftedAction.action = action;
    if (!action.type) liftedAction.action.type = action.id || action.actionType || 'update';
  } else if (typeof action === 'undefined') {
    liftedAction.action = 'update';
  } else {
    liftedAction.action = { type: action };
  }
  return liftedAction;
}

export function send(action, state, name, type, instanceId) {
  start();
  setTimeout(() => {
    const message = {
      payload: state ? stringify(state) : '',
      action: type === 'ACTION' ? stringify(transformAction(action)) : action,
      type: type || 'ACTION',
      id: instanceId,
      instanceId,
      name,
    };
    postMessage({ __IS_REDUX_NATIVE_MESSAGE__: true, content: message });
  }, 0);
}

export function connect(options = {}) {
  const id = generateId(options.instanceId);
  const name = options.name || id;
  start();
  return {
    init(state, action) {
      send(action || {}, state, name, 'INIT', id);
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
        send(action, payload, name, 'ACTION', id);
      } else {
        send(undefined, payload, name, 'STATE', id);
      }
    },
    error(payload) {
      send(undefined, payload, name, 'Error', id);
    },
  };
}
