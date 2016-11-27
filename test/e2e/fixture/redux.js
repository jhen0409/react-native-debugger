const { createStore } = require('redux');

const store1 = createStore(
  state => state,
  { value: 0 },
  global.reduxNativeDevTools({
    name: 'Redux store instance 1',
    actionsWhitelist: [
      '@@INIT',
      'TEST_PASS_FOR_REDUX_STORE_1',
      '^SHOW_FOR_REDUX_STORE_1$',
    ],
  })
);

const store2 = createStore(
  state => state,
  { value: 1 },
  global.reduxNativeDevTools({
    name: 'Redux store instance 2',
    actionsBlacklist: [
      'NOT_SHOW_1_FOR_REDUX_STORE_2',
      'NOT_SHOW_2_FOR_REDUX_STORE_2',
    ],
  })
);

store1.dispatch({ type: 'TEST_PASS_FOR_REDUX_STORE_1' });
store1.dispatch({ type: 'SHOW_FOR_REDUX_STORE_1' });
store1.dispatch({ type: 'NOT_SHOW_FOR_REDUX_STORE_1' });

store2.dispatch({ type: 'TEST_PASS_FOR_REDUX_STORE_2' });
store2.dispatch({ type: 'NOT_SHOW_1_FOR_REDUX_STORE_2' });
store2.dispatch({ type: 'NOT_SHOW_2_FOR_REDUX_STORE_2' });
