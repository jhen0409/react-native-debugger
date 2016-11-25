import webpack from 'webpack';
import baseConfig from './base.babel';

export default {
  ...baseConfig,
  devtool: 'source-map',
  entry: './app/index',
  output: {
    ...baseConfig.output,
    publicPath: 'js/',
  },
  module: {
    loaders: [
      ...baseConfig.module.loaders,
      {
        test: /\.css?$/,
        loaders: ['style', 'raw'],
      },
    ],
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      __REACT_DEVTOOLS_GLOBAL_HOOK__: 'false',
    }),
  ],
  target: 'electron-renderer',
};
