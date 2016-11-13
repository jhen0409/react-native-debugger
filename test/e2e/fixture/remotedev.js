const { createStore } = require('redux');
const connectViaExtension = window.__REMOTEDEV__.connect;

function logReducer(reducer) {
  const remotedev = connectViaExtension({
    name: 'Store instance 4 for RemoteDev'
  });
  return (state, action) => {
    const reducedState = reducer(state, action);
    remotedev.send(action, reducedState);
    return reducedState;
  };
}

function logRemotely(next) {
  return function (reducer, initialState) {
    return next(logReducer(reducer), initialState);
  };
}

const store = logRemotely(createStore)(
  function(state) { return state; },
  { value: 0 }
);

store.dispatch({ type: 'TEST_PASS_FOR_STORE_4' });
