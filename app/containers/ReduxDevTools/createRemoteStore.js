import { stringify } from 'jsan';
import createDevStore from 'remotedev-app/lib/store/createDevStore';
import updateState from 'remotedev-app/lib/store/updateState';

let store;
let worker;
let workerOnMessage;

export const createRemoteStore = onError => {
  store = createDevStore((type, action, id, bareState) => {
    let state = bareState;
    if (type !== 'IMPORT') state = stringify(state);

    if (worker) {
      worker.postMessage({
        method: 'emitReduxMessage',
        content: { type, action, state },
      });
    }
  });
  workerOnMessage = (message) => {
    const { data } = message;
    if (data && data.__IS_REDUX_NATIVE_MESSAGE__) {
      const { content: msg } = data;
      if (msg.type === 'ERROR') {
        onError(msg.payload);
        return;
      }
      updateState(store, msg);
    }
  };
  return store;
};

export const setWorker = instance => {
  if (worker) {
    worker.removeEventListener('message', workerOnMessage);
  }
  if (instance) {
    instance.addEventListener('message', workerOnMessage);
  }
  worker = instance;
};

export const importState = state =>
  store.liftedStore.importState(state);

export const exportState = () =>
  store.liftedStore.getState();
