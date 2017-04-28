import React from 'react';
import { Provider } from 'react-redux';
import Counter from './src/containers/Counter';
import configureStore from './src/configureStore';

const store = configureStore();

export default () => (
  <Provider store={store}>
    <Counter />
  </Provider>
);
