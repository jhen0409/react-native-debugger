var createStore = require('redux').createStore;

const store1 = createStore(
  function(state) { return state; },
  { value: 0 },
  global.reduxNativeDevTools({
    name: 'Store instance 1',
  })
);

const store2 = createStore(
  function(state) { return state; },
  { value: 1 },
  global.reduxNativeDevTools({
    name: 'Store instance 2',
  })
);

store1.dispatch({ type: 'TEST_PASS_FOR_STORE_1' });
store2.dispatch({ type: 'TEST_PASS_FOR_STORE_2' });
