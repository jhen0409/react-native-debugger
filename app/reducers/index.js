import { combineReducers } from 'redux';
import setting from './setting';
import debuggerReducer from './debugger';

export default combineReducers({
  setting,
  debugger: debuggerReducer,
});
