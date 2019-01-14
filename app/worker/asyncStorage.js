export const getClearAsyncStorageFn = AsyncStorage => {
  if (!AsyncStorage.clear) return;
  return () => AsyncStorage.clear().catch(f => f);
};

export const getSafeAsyncStorage = AsyncStorage => ({
  async getItem(key) {
    try {
      return AsyncStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  async setItem(key, value) {
    try {
      return AsyncStorage.setItem(key, value);
    } catch (e) {
      return null;
    }
  },
});

export const getShowAsyncStorageFn = AsyncStorage => {
  if (!AsyncStorage.getAllKeys || !AsyncStorage.getItem) return;
  return async () => {
    const keys = await AsyncStorage.getAllKeys();
    const items = await Promise.all(keys.map(key => AsyncStorage.getItem(key)));
    const table = {};
    if (keys.length) {
      keys.forEach((key, index) => (table[key] = { content: items[index] }));
      console.table(table);
    } else {
      console.log('[RNDebugger] No AsyncStorage content.');
    }
  };
};
