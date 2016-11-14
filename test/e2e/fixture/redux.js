const { createStore } = require('redux');

const store1 = createStore(
  state => state,
  { value: 0 },
  global.reduxNativeDevTools({
    name: 'Redux store instance 1',
  })
);

const store2 = createStore(
  state => state,
  { value: 1 },
  global.reduxNativeDevTools({
    name: 'Redux store instance 2',
  })
);

store1.dispatch({ type: 'TEST_PASS_FOR_REDUX_STORE_1' });
store2.dispatch({ type: 'TEST_PASS_FOR_REDUX_STORE_2' });
