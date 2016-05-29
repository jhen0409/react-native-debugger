import { combineReducers } from 'redux';
import debuggerReducer from './debugger';

export default combineReducers({
  debugger: debuggerReducer,
});
