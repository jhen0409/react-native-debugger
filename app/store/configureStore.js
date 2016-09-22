import { createStore } from 'redux';
import { autoRehydrate, persistStore } from 'redux-persist';
import reducer from '../reducers';

export default initialState => {
  const store = createStore(reducer, initialState, autoRehydrate());
  persistStore(store, { whitelist: ['setting'] });
  return store;
};
