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
      ],
    }, {
      test: /\.json/,
      loader: 'json',
    }],
  },
  externals: [
    'react-devtools-core/standalone',
    // just avoid warning.
    // this is not really used from ws. (it used fallback)
    'utf-8-validate', 'bufferutil',
  ],
};
