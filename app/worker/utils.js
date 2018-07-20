/* eslint-disable no-underscore-dangle */

// Avoid warning of use `window.require` on dev mode
// it actually unnecessary for RN >= 0.56, so it is backward compatibility
const avoidWarnForRequire = moduleNames => {
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

let reactNative;

const lookupForRN = (size = 999) => {
  try {
    for (let i = 0; i <= size - 1; i++) {
      const rn = window.require(i);
      if (rn.requireNativeComponent && rn.NativeModules) {
        return rn;
      }
    }
  } catch (e) {} // eslint-disable-line
  return null;
};

const getModule = (name, size) => {
  let result;
  try {
    reactNative = reactNative || lookupForRN(size);
    result = reactNative && reactNative[name];
  } finally {
    // Backward compatibility
    try {
      result = result || window.require(name);
    } catch (e) {} // eslint-disable-line
  }
  return result || { __empty: true };
};

const requiredModules = {
  MessageQueue: () =>
    Object.getPrototypeOf(self.__fbBatchedBridge).constructor || window.require('MessageQueue'),
  NativeModules: size => getModule('NativeModules', size),
  AsyncStorage: size => getModule('AsyncStorage', size),
  Platform: size => getModule('Platform', size),
  setupDevtools: size => getModule('setupDevtools', size),
};

export const getRequiredModules = async size => {
  if (!window.__DEV__ || typeof window.require !== 'function') return;
  const done = await avoidWarnForRequire(Object.keys(requiredModules));
  const modules = {};
  for (const name of Object.keys(requiredModules)) {
    modules[name] = requiredModules[name](size);
  }
  done();
  return modules;
};

const TO_JS = 0;
const isRNDInterval = info =>
  info.type === TO_JS &&
  info.module === 'JSTimersExecution' &&
  info.method === 'callTimers' &&
  info.args &&
  info.args[0] &&
  info.args[0][0] === self.__RND_INTERVAL__;

export const ignoreRNDIntervalSpy = async ({ MessageQueue }) => {
  if (MessageQueue.__empty) return;
  // Wrap spy function if it already set
  if (MessageQueue.prototype.__spy) {
    const originalSpyFn = MessageQueue.prototype.__spy;
    MessageQueue.prototype.__spy = info => {
      if (isRNDInterval(info)) return;
      return originalSpyFn(info);
    };
  }
  MessageQueue.spy = spyOrToggle => {
    if (spyOrToggle === true) {
      MessageQueue.prototype.__spy = info => {
        if (isRNDInterval(info)) return;
        console.log(
          `${info.type === TO_JS ? 'N->JS' : 'JS->N'} : ` +
            `${info.module ? `${info.module}.` : ''}${info.method}` +
            `(${JSON.stringify(info.args)})`
        );
      };
    } else if (spyOrToggle === false) {
      MessageQueue.prototype.__spy = null;
    } else {
      MessageQueue.prototype.__spy = info => {
        if (isRNDInterval(info)) return;
        return spyOrToggle(info);
      };
    }
  };
};
