/* eslint prefer-arrow-callback: 0 */
import { observable, action, useStrict } from 'mobx';
import remotedev from 'mobx-remotedev/lib/dev';

useStrict(true);

export default function run() {
  const store = observable({ value: 0 });
  store.testPassForMobXStore1 = action(function testPassForMobXStore1() {});

  remotedev(store, { name: 'MobX store instance 1' }).testPassForMobXStore1();

  const store2 = observable({ value: 1 });
  store2.testPassForMobXStore2 = action(function testPassForMobXStore2() {});

  remotedev(store2, { name: 'MobX store instance 2' }).testPassForMobXStore2();
}
