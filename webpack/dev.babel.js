import webpack from 'webpack';
import baseConfig from './base.babel';

const host = 'localhost';
const port = 3000;

export default {
  ...baseConfig,
  devtool: 'eval-cheap-module-source-map',
  devServer: { host, port },
  entry: './app/index',
  output: {
    ...baseConfig.output,
    publicPath: `http://localhost:${port}/js/`,
  },
  plugins: [
    ...baseConfig.plugins,
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ],
};
