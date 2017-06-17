// Avoid warning of use `window.require` on dev mode
export const avoidWarnForRequire = (...moduleNames) => {
  if (!moduleNames.length) moduleNames.push('NativeModules');
  return new Promise(resolve =>
    setTimeout(() => {
      // It's replaced console.warn of react-native
      const originalWarn = console.warn;
      console.warn = (...args) => {
        if (
          args[0] &&
          moduleNames.some(name => args[0].indexOf(`Requiring module '${name}' by name`) > -1)
        ) {
          return;
        }
        return originalWarn(...args);
      };
      resolve(() => {
        console.warn = originalWarn;
      });
    })
  );
};

const delay = time => new Promise(resolve => setTimeout(resolve, time));
const isWindowRequireAvailable = () => typeof window !== 'undefined' && window.require;

export const waitingUntilWindowRequireAvailable = async () => {
  if (isWindowRequireAvailable()) return true;

  let attempts = 10;
  while (attempts > 0) {
    await delay(100);
    if (isWindowRequireAvailable()) return true;
    attempts--;
  }
  return false;
};
