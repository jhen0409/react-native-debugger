const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const baseConfig = require('./base')

const baseProdConfig = {
  ...baseConfig,
  mode: 'production',
  devtool: 'hidden-source-map',
  output: {
    ...baseConfig.output,
    publicPath: 'js/',
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
      'process.env.NODE_ENV': JSON.stringify('production'),
      __REACT_DEVTOOLS_GLOBAL_HOOK__: 'false',
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: { output: { comments: false } },
      }),
    ],
  },
}

const buildProdConfig = (config) => ({
  ...baseProdConfig,
  ...config,
})

module.exports = [
  buildProdConfig({
    entry: './app/index',
    target: 'electron-renderer',
    plugins: [
      ...baseProdConfig.plugins,
      process.env.ANALYZE_BUNDLE ? new BundleAnalyzerPlugin() : null,
    ].filter(Boolean),
  }),
  buildProdConfig({
    entry: './app/worker/index.js',
    resolve: {
      ...baseProdConfig.resolve,
      aliasFields: ['browser'],
    },
    output: {
      ...baseProdConfig.output,
      filename: 'RNDebuggerWorker.js',
      libraryTarget: undefined,
    },
    target: 'webworker',
  }),
]
