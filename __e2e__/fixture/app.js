import './setup'

import runXHRTest from './xhr-test' // Install fetch polyfill before initial apollo-client
import runApolloTest from './apollo'
import runReduxTest from './redux'
import runMobXTest from './mobx'
import runRemoteDevTest from './remotedev'

runReduxTest()
runMobXTest()
runRemoteDevTest()
runApolloTest().catch((e) => console.error(e))
runXHRTest().catch((e) => console.error(e))
