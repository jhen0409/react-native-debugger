module.exports = (api) => {
  api.cache(true)
  return {
    presets: [['@babel/preset-env', { targets: { node: '18.5' } }], '@babel/preset-react'],
    plugins: [],
    env: {
      production: {
        plugins: [
          '@babel/plugin-transform-react-inline-elements',
          '@babel/plugin-transform-react-constant-elements',
          'transform-react-remove-prop-types',
        ],
      },
    },
  }
}
