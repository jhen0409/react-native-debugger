import { observable, action, useStrict } from 'mobx';
import remotedev from 'mobx-remotedev/lib/dev';

useStrict(true);

export default function run() {
  const store = observable({ value: 0 });
  store.testPassForMobXStore1 = action(() => {});

  remotedev(store, { name: 'MobX store instance 1' }).testPassForMobXStore1();

  const store2 = observable({ value: 1 });
  store2.testPassForMobXStore2 = action(() => {});

  remotedev(store2, { name: 'MobX store instance 2' }).testPassForMobXStore2();
}
