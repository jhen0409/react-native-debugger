import { combineReducers } from 'redux'
import { section } from '@redux-devtools/app/lib/esm/reducers/section'
// import { connection } from '@redux-devtools/app/lib/esm/reducers/connection';
// import { socket } from '@redux-devtools/app/lib/esm/reducers/socket';
import { monitor } from '@redux-devtools/app/lib/esm/reducers/monitor'
import { notification } from '@redux-devtools/app/lib/esm/reducers/notification'
import { instances } from '@redux-devtools/app/lib/esm/reducers/instances'
import { reports } from '@redux-devtools/app/lib/esm/reducers/reports'
import { theme } from '@redux-devtools/app/lib/esm/reducers/theme'

import setting from './setting'
import debuggerReducer from './debugger'

export default combineReducers({
  section,
  instances,
  reports,
  theme,
  monitor,
  notification,

  setting,
  debugger: debuggerReducer,
})
