import webpack from 'webpack';
import baseConfig from './base.babel';

const host = 'localhost';
const port = 3000;

const baseDevConfig = {
  ...baseConfig,
  devtool: 'inline-source-map',
  devServer: { host, port },
  output: {
    ...baseConfig.output,
    publicPath: `http://localhost:${port}/js/`,
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
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ],
};

const buildDevConfig = config => ({
  ...baseDevConfig,
  ...config,
});

export default [
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
];
