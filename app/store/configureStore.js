import { createStore, applyMiddleware, compose } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import localForage from 'localforage';
import { exportStateMiddleware } from '@redux-devtools/app/lib/cjs/middlewares/exportState';
import debuggerAPI from '../middlewares/debuggerAPI';
import reduxAPI from '../middlewares/reduxAPI';
import rootReducer from '../reducers';

const persistConfig = {
  key: 'redux-devtools',
  blacklist: ['instances', 'debugger'],
  storage: localForage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const middlewares = applyMiddleware(
  debuggerAPI,
  exportStateMiddleware,
  reduxAPI,
);

// If Redux DevTools Extension is installed use it, otherwise use Redux compose
/* eslint-disable no-underscore-dangle */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
/* eslint-enable no-underscore-dangle */
const enhancer = composeEnhancers(middlewares);

export default (callback) => {
  const store = createStore(persistedReducer, undefined, enhancer);
  const persistor = persistStore(store, null, () => callback?.(store));
  return { store, persistor };
};
