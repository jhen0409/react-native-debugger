import path from 'path';
import webpack from 'webpack';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import baseConfig from './base.babel';

export default {
  ...baseConfig,
  mode: 'production',
  devtool: 'hidden-source-map',
  entry: './electron/main',
  output: {
    ...baseConfig.output,
    path: path.join(__dirname, '../dist'),
    filename: './main.js',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
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
  target: 'electron-main',
  node: {
    __dirname: false,
    __filename: false,
  },
};
