import React from 'react';

import Counter from './src/containers/Counter';
import CounterStore from './src/stores/counter';

export default () => <Counter store={new CounterStore()} />;
