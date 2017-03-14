self.window = global;
window.require = moduleName => {
  // https://github.com/facebook/react-native/blob/5403946f098cc72c3d33ea5cee263fb3dd03891d/packager/src/Resolver/polyfills/require.js#L97
  console.warn(
    'Requiring module \'' + moduleName + '\' by name is only supported for ' +
    'debugging purposes and will BREAK IN PRODUCTION!'
  );
  if (moduleName !== 'NativeModules') return undefined;
  return {};
};

require('./redux');
require('./mobx');
require('./remotedev');
