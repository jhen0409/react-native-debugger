export const getClearAsyncStorageFn = AsyncStorage => {
  if (!AsyncStorage.clear) return;
  return () => AsyncStorage.clear().catch(f => f);
};

function convertError(error): ?Error {
  if (!error) {
    return null;
  }
  const out = new Error(error.message);
  out.key = error.key;
  return out;
}

function convertErrors(errs) {
  if (!errs) {
    return null;
  }
  return (Array.isArray(errs) ? errs : [errs]).map(e => convertError(e));
}

export const getSafeAsyncStorage = NativeModules => {
  const RCTAsyncStorage =
    NativeModules &&
    (NativeModules.RNC_AsyncSQLiteDBStorage ||
      NativeModules.RNCAsyncStorage ||
      NativeModules.PlatformLocalStorage ||
      NativeModules.AsyncRocksDBStorage ||
      NativeModules.AsyncSQLiteDBStorage ||
      NativeModules.AsyncLocalStorage);

  return {
    getItem(key) {
      if (!RCTAsyncStorage) return Promise.resolve(null);
      return new Promise((resolve, reject) => {
        RCTAsyncStorage.multiGet([key], (errors, result) => {
          // Unpack result to get value from [[key,value]]
          const value =
            result && result[0] && result[0][1] ? result[0][1] : null;
          const errs = convertErrors(errors);
          if (errs) {
            reject(errs[0]);
          } else {
            resolve(value);
          }
        });
      });
    },
    async setItem(key, value) {
      if (!RCTAsyncStorage) return Promise.resolve(null);
      return new Promise((resolve, reject) => {
        RCTAsyncStorage.multiSet([[key, value]], errors => {
          const errs = convertErrors(errors);
          if (errs) {
            reject(errs[0]);
          } else {
            resolve(null);
          }
        });
      });
    },
    clear() {
      if (!RCTAsyncStorage) return Promise.resolve(null);
      return new Promise((resolve, reject) => {
        RCTAsyncStorage.clear(error => {
          if (error && convertError(error)) {
            reject(convertError(error));
          } else {
            resolve(null);
          }
        });
      });
    },
    getAllKeys() {
      if (!RCTAsyncStorage) return Promise.resolve(null);
      return new Promise((resolve, reject) => {
        RCTAsyncStorage.getAllKeys((error, keys) => {
          if (error) {
            reject(convertError(error));
          } else {
            resolve(keys);
          }
        });
      });
    },
  };
};

export const getShowAsyncStorageFn = AsyncStorage => {
  if (!AsyncStorage.getAllKeys || !AsyncStorage.getItem) return;
  return async () => {
    const keys = await AsyncStorage.getAllKeys();
    if (keys && keys.length) {
      const items = await Promise.all(
        keys.map(key => AsyncStorage.getItem(key)),
      );
      const table = {};
      keys.forEach((key, index) => (table[key] = { content: items[index] }));
      console.table(table);
    } else {
      console.log('[RNDebugger] No AsyncStorage content.');
    }
  };
};
