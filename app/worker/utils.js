/* eslint-disable no-underscore-dangle */

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

const TO_JS = 0;
const isRNDInterval = info =>
  info.type === TO_JS &&
  info.module === 'JSTimersExecution' &&
  info.method === 'callTimers' &&
  info.args &&
  info.args[0] &&
  info.args[0][0] === self.__RND_INTERVAL__;

export const ignoreRNDIntervalSpy = async () => {
  const done = await avoidWarnForRequire('MessageQueue');
  const MessageQueue = window.__DEV__ ? window.require('MessageQueue') : {};
  done();

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
