import webpack from 'webpack';
import BabiliPlugin from 'babili-webpack-plugin';
import baseConfig from './base.babel';

const baseProdConfig = {
  ...baseConfig,
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
        use: ['style-loader', 'raw-loader'],
      },
    ],
  },
  plugins: [
    ...baseConfig.plugins,
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      __REACT_DEVTOOLS_GLOBAL_HOOK__: 'false',
    }),
    new BabiliPlugin(
      {},
      {
        comments: false,
      }
    ),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
};

const buildProdConfig = config => ({
  ...baseProdConfig,
  ...config,
});

export default [
  buildProdConfig({
    entry: './app/index',
    target: 'electron-renderer',
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
];
