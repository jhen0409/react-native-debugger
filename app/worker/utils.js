/* eslint-disable no-underscore-dangle */

// Avoid warning of use metro require on dev mode
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

const getRequireMethod = () => {
  // RN >= 0.57
  if (typeof window.__r === 'function') return window.__r;
  // RN < 0.57
  if (typeof window.require === 'function') return window.require;
};

const lookupForRNModules = (size = 999) => {
  const metroRequire = getRequireMethod();
  for (let moduleId = 0; moduleId <= size - 1; moduleId++) {
    const rn = metroRequire(moduleId);
    if (rn.requireNativeComponent && rn.NativeModules) {
      return rn;
    }
  }
  return null;
};

const getModule = (name, size) => {
  let result;
  try {
    const metroRequire = getRequireMethod();
    // RN >= 0.56
    if (metroRequire.name === 'metroRequire') {
      reactNative = global.$reactNative = reactNative || lookupForRNModules(size);
      result = reactNative && reactNative[name];
    } else if (metroRequire.name === '_require') {
      result = metroRequire(name);
    }
  } catch (e) {} // eslint-disable-line
  return result || { __empty: true };
};

const requiredModules = {
  MessageQueue: size =>
    (self.__fbBatchedBridge && Object.getPrototypeOf(self.__fbBatchedBridge).constructor) ||
    getModule('MessageQueue', size),
  NativeModules: size => getModule('NativeModules', size),
  AsyncStorage: size => getModule('AsyncStorage', size),
  Platform: size => getModule('Platform', size),
  setupDevtools: size => getModule('setupDevtools', size),
};

export const getRequiredModules = async size => {
  if (!window.__DEV__ || !getRequireMethod()) return;
  const done = await avoidWarnForRequire(Object.keys(requiredModules));
  const modules = {};
  for (const name of Object.keys(requiredModules)) {
    modules[name] = requiredModules[name](size);
  }
  done();
  return modules;
};

const TO_JS = 0;
const isIntervalMatch = (intervalIdList, info) =>
  info.type === TO_JS &&
  (info.module === 'JSTimersExecution' || info.module === 'JSTimers') &&
  info.method === 'callTimers' &&
  info.args &&
  info.args[0] &&
  intervalIdList.includes(info.args[0][0]);

export const ignoreRNDIntervalSpy = async ({ MessageQueue }, intervals = []) => {
  if (MessageQueue.__empty) return;
  // Wrap spy function if it already set
  const intervalIdList = [self.__RND_INTERVAL__].concat(intervals);
  if (MessageQueue.prototype.__spy) {
    const originalSpyFn = MessageQueue.prototype.__spy;
    MessageQueue.prototype.__spy = info => {
      if (isIntervalMatch(intervalIdList, info)) return;
      return originalSpyFn(info);
    };
  }
  MessageQueue.spy = spyOrToggle => {
    if (spyOrToggle === true) {
      MessageQueue.prototype.__spy = info => {
        if (isIntervalMatch(intervalIdList, info)) return;
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
        if (isIntervalMatch(intervalIdList, info)) return;
        return spyOrToggle(info);
      };
    }
  };
};
