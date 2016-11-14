const { observable, action, useStrict } = require('mobx');
const remotedev = require('mobx-remotedev/lib/dev').default;

useStrict(true);

const counter = observable({
  counter: 0,
});

counter.increment = action(function increment() {
  counter.counter++;
});

const store = remotedev(counter, { name: 'Store instance 3 for MobX' });

store.increment();
