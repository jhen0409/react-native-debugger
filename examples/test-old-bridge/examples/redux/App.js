import React from 'react';
import { Provider } from 'react-redux';
import Counter from './containers/Counter';
import configureStore from './configureStore';

const store = configureStore();

export default () => (
  <Provider store={store}>
    <Counter />
  </Provider>
);
