import webpack from 'webpack';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import baseConfig from './base.babel';

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
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        sourceMap: true,
        uglifyOptions: { output: { comments: false } },
      }),
    ],
  },
};

const buildProdConfig = config => ({
  ...baseProdConfig,
  ...config,
});

export default [
  buildProdConfig({
    entry: './app/index',
    target: 'electron-renderer',
    plugins: [
      ...baseProdConfig.plugins,
      process.env.ANALYZE_BUNDLE ? new BundleAnalyzerPlugin() : null,
    ].filter(p => p),
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
