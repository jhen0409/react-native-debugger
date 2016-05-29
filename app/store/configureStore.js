import { createStore } from 'redux';
import reducer from '../reducers';

export default initialState =>
  createStore(reducer, initialState);
