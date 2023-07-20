import React from 'react';

import Counter from './containers/Counter';
import CounterStore from './stores/counter';

export default () => <Counter store={new CounterStore()} />;
