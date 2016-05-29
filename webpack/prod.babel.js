import webpack from 'webpack';
import baseConfig from './base.babel';

export default {
  ...baseConfig,
  output: {
    ...baseConfig.output,
    publicPath: 'js/',
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      __REACT_DEVTOOLS_GLOBAL_HOOK__: 'false',
    }),
  ],
};
