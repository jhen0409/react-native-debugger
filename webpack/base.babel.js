import { join } from 'path';

export default {
  output: {
    path: join(__dirname, '../dist/js'),
    filename: 'bundle.js',
    libraryTarget: 'commonjs2',
  },
  plugins: [
  ],
  resolve: {
    extensions: ['', '.js'],
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      include: [
        join(__dirname, '../app'),
        join(__dirname, '../electron'),
        join(__dirname, '../node_modules/react-devtools'),
      ],
      exclude: [
        join(__dirname, '../node_modules/react-devtools/node_modules'),
      ],
    }, {
      test: /\.json/,
      loader: 'json',
    }],
  },
  externals: [
    // just avoid warning.
    // this is not really used from ws. (it used fallback)
    'bufferutil', 'utf-8-validate',
  ],
};
