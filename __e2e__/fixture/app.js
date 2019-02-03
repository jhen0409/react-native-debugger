import './setup';
import runReduxTest from './redux';
import runMobXTest from './mobx';
import runRemoteDevTest from './remotedev';
import runXHRTest from './xhr-test';
import './apollo';

runReduxTest();
runMobXTest();
runRemoteDevTest();
runXHRTest();
