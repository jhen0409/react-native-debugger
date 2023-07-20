/* eslint global-require: 0 */
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from '@redux-devtools/extension';
import thunk from 'redux-thunk';
import reducer from './reducers';

const middlewares = [thunk];
const enhancer = composeWithDevTools({
  // Options:https://github.com/reduxjs/redux-devtools/blob/main/extension/docs/API/Arguments.md
})(applyMiddleware(...middlewares));

export default function configureStore(initialState) {
  const store = createStore(reducer, initialState, enhancer);
  if (module.hot) {
    module.hot.accept(() => {
      store.replaceReducer(require('./reducers').default);
    });
  }
  return store;
}
