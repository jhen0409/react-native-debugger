import { createStore, applyMiddleware, compose } from 'redux';
import { autoRehydrate, persistStore } from 'redux-persist';
import reduxAPI from '../middlewares/redux-api';
import reducer from '../reducers';

const middlewares = applyMiddleware(reduxAPI);

// If Redux DevTools Extension is installed use it, otherwise use Redux compose
/* eslint-disable no-underscore-dangle */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
/* eslint-enable no-underscore-dangle */
const enhancer = composeEnhancers(
  middlewares,
  autoRehydrate()
);

export default initialState => {
  const store = createStore(reducer, initialState, enhancer);
  persistStore(store, { whitelist: ['setting', 'monitor', 'test'] });
  return store;
};
