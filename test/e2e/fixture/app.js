var createStore = require('redux').createStore;

createStore(
  function(state) { return state; },
  { value: 0 },
  global.reduxNativeDevTools()
);
