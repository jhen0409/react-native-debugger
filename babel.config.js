module.exports = (api) => {
  api.cache(true);
  return {
    presets: [['@babel/preset-env', { targets: { node: '12.8' } }], '@babel/preset-react'],
    plugins: [
      // 'transform-class-properties',
      // 'transform-object-rest-spread',
      // 'transform-decorators-legacy',
    ],
    // env: {
    //   production: {
    //     plugins: [
    //       'transform-react-inline-elements',
    //       'transform-react-remove-prop-types',
    //       'transform-react-constant-elements',
    //       'closure-elimination',
    //     ],
    //   },
    // },
  };
};
