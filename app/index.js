import { remote, webFrame } from 'electron';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import './setup';
import App from './containers/App';
import configureStore from './store/configureStore';

if (process.platform === 'darwin') {
  // Reset TouchBar when reload the app
  remote.getCurrentWindow().setTouchBar([]);
}

webFrame.setZoomFactor(1);
webFrame.setZoomLevelLimits(1, 1);

const store = configureStore();

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
