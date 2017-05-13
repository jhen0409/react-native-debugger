import path from 'path';
import webpack from 'webpack';
import BabiliPlugin from 'babili-webpack-plugin';
import baseConfig from './base.babel';

export default {
  ...baseConfig,
  devtool: 'hidden-source-map',
  entry: './electron/main',
  output: {
    ...baseConfig.output,
    path: path.join(__dirname, '../dist'),
    filename: './main.js',
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false,
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new BabiliPlugin(
      {},
      {
        comments: false,
      }
    ),
  ],
  target: 'electron-main',
  node: {
    __dirname: false,
    __filename: false,
  },
};
