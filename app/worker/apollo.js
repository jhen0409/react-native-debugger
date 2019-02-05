import Bridge from 'apollo-client-devtools/src/bridge';
import { initBackend, sendBridgeReady } from 'apollo-client-devtools/src/backend';
import { version as devToolsVersion } from 'apollo-client-devtools/package.json';
import { getSafeAsyncStorage } from './asyncStorage';

export function handleApolloClient({ AsyncStorage } = {}) {
  const interval = setInterval(() => {
    if (!self.__APOLLO_CLIENT__) {
      return;
    }

    clearInterval(interval);

    const hook = {
      ApolloClient: self.__APOLLO_CLIENT__,
      devToolsVersion,
    };

    let listener;

    const bridge = new Bridge({
      listen(fn) {
        listener = self.addEventListener('message', evt => {
          if (evt.data.source === 'apollo-devtools-proxy') {
            return fn(evt.data);
          }
        });
      },
      send(data) {
        postMessage({
          ...data,
          source: 'apollo-devtools-backend',
        });
      },
    });

    bridge.on('init', () => {
      sendBridgeReady();
    });

    bridge.on('shutdown', () => {
      self.removeEventListener('message', listener);
    });

    initBackend(bridge, hook, getSafeAsyncStorage(AsyncStorage));
  }, 1000);
  return interval;
}
