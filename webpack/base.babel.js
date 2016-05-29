import path from 'path';

export default {
  entry: './app/index',
  output: {
    path: path.join(__dirname, '../dist/js'),
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
      include: [/app/, /node_modules\/react-devtools/],
    }],
  },
  target: 'electron-renderer',
  externals: [
    'ws',
  ],
};
