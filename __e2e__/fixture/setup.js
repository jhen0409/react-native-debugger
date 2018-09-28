/* eslint no-underscore-dangle: 0 */

self.window = global;

// Remove native fetch as react-native use whatwg-fetch polyfill
self.fetch = undefined;

const MessageQueue = function MessageQueue() {};
MessageQueue.spy = () => {};
MessageQueue.prototype.__spy = null;

const requiredModules = {
  NativeModules: {},
  Platform: {},
  setupDevtools: undefined,
  AsyncStorage: {},
  MessageQueue,
};
// Simulate React Native's window.require polyfill
window.require = moduleName => {
  if (typeof moduleName !== 'number') {
    // From https://github.com/facebook/react-native/blob/5403946f098cc72c3d33ea5cee263fb3dd03891d/packager/src/Resolver/polyfills/require.js#L97
    console.warn(
      `Requiring module '${moduleName}' by name is only supported for ` +
        'debugging purposes and will BREAK IN PRODUCTION!'
    );
  }
  return requiredModules[moduleName];
};
window.__DEV__ = true;
window.__fbBatchedBridge = new MessageQueue();
