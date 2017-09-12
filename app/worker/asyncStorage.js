export const getClearAsyncStorageFn = AsyncStorage => {
  if (!AsyncStorage.clear) return;
  return () => AsyncStorage.clear().catch(f => f);
};

export const getShowAsyncStorageFn = AsyncStorage => {
  if (!AsyncStorage.getAllKeys || !AsyncStorage.getItem) return;
  return async () => {
    const keys = await AsyncStorage.getAllKeys();
    const items = await Promise.all(keys.map(key => AsyncStorage.getItem(key)));
    const table = {};
    keys.forEach((key, index) => (table[key] = { content: items[index] }));
    console.table(table);
  };
};
