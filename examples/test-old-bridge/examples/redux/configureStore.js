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
  return createStore(reducer, initialState, enhancer);
}
