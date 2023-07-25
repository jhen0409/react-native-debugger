const webpack = require('webpack')
const baseConfig = require('./base')

const port = 3000

const baseDevConfig = {
  ...baseConfig,
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    ...baseConfig.output,
    publicPath: `http://localhost:${port}/js/`,
  },
  module: {
    rules: [
      ...baseConfig.module.rules,
      {
        test: /\.css?$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    ...baseConfig.plugins,
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ],
}

const buildDevConfig = (config) => ({
  ...baseDevConfig,
  ...config,
})

module.exports = [
  buildDevConfig({
    entry: './app/index',
    target: 'electron-renderer',
  }),
  buildDevConfig({
    entry: './app/worker/index.js',
    resolve: {
      ...baseDevConfig.resolve,
      aliasFields: ['browser'],
    },
    output: {
      ...baseDevConfig.output,
      filename: 'RNDebuggerWorker.js',
      libraryTarget: undefined,
    },
    target: 'webworker',
  }),
]
