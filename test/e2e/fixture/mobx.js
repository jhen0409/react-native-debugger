const { observable, action, useStrict } = require('mobx');
const remotedev = require('mobx-remotedev/lib/dev').default;

useStrict(true);

const store = observable({ value: 0 });
store.testPassForMobXStore1 = action(function testPassForMobXStore1() {});
remotedev(store, { name: 'MobX store instance 1' })
  .testPassForMobXStore1();

const store2 = observable({ value: 1 });
store2.testPassForMobXStore2 = action(function testPassForMobXStore2() {});
remotedev(store2, { name: 'MobX store instance 2' })
  .testPassForMobXStore2();
