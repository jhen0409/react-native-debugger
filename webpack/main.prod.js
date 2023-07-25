const path = require('path')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const baseConfig = require('./base')

module.exports = {
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
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: { output: { comments: false } },
      }),
    ],
  },
  target: 'electron-main',
  node: {
    __dirname: false,
    __filename: false,
  },
}
