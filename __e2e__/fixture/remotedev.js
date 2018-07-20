import { createStore } from 'redux';

const connectViaExtension = window.devToolsExtension.connect;

const logReducer = reducer => {
  const remotedev = connectViaExtension({
    name: 'RemoteDev store instance 1',
    actionCreators: {
      test: () => {},
    },
  });
  return (state, action) => {
    const reducedState = reducer(state, action);
    remotedev.send(action, reducedState);
    return reducedState;
  };
};

const logRemotely = next => (reducer, initialState) => next(logReducer(reducer), initialState);

export default function run() {
  const store = logRemotely(createStore)(state => state, { value: 0 });

  store.dispatch({ type: 'TEST_PASS_FOR_REMOTEDEV_STORE_1' });
}
