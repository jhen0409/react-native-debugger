import { remote, webFrame } from 'electron';
import getPort from 'get-port';
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

window.checkWindowInfo = () => {
  const debuggerState = store.getState().debugger;
  const isWorkerRunning = !!debuggerState.worker;
  const location = debuggerState.location;
  const isPortSettingRequired = debuggerState.isPortSettingRequired;
  return { isWorkerRunning, isPortSettingRequired, location };
};

getPort().then(port => {
  window.reactDevToolsPort = port;
  render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root'),
  );
});
