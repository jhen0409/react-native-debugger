module.exports = (api) => {
  api.cache(true);
  return {
    presets: [['env', { targets: { node: '12' } }]],
  };
};
