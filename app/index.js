import getPort from 'get-port';
import { webFrame } from 'electron';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import App from './containers/App';
import configureStore from './store/configureStore';
import { client, tryADBReverse } from './utils/adb';

webFrame.setZoomFactor(1);
webFrame.setZoomLevelLimits(1, 1);

const store = configureStore();

// Provide for user
window.adb = client;
window.adb.reverseAll = tryADBReverse;
// TODO: provide adb function for reverse RN packager port

window.checkWindowInfo = () => {
  const debuggerState = store.getState().debugger;
  return {
    isWorkerRunning: !!debuggerState.worker,
    location: debuggerState.location,
    isPortSettingRequired: debuggerState.isPortSettingRequired,
  };
};

getPort().then(port => {
  window.reactDevToolsPort = port;
  render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root')
  );
});
