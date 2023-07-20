import { observable, action } from 'mobx';
import remotedev from 'mobx-remotedev';

// Options: https://github.com/zalmoxisus/mobx-remotedev#api
@remotedev({
  name: 'CounterStore',
})
export default class Counter {
  @observable counter = 0;

  @action increment() {
    this.counter++;
  }

  @action decrement() {
    this.counter--;
  }

  incrementIfOdd() {
    if (this.counter % 2 === 0) {
      return;
    }
    this.increment();
  }

  incrementAsync(delay = 1000) {
    setTimeout(() => {
      this.increment();
    }, delay);
  }
}
