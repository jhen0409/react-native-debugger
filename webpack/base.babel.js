import path from 'path';

export default {
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
      include: [/app/, /electron/, /node_modules\/react-devtools/],
    }],
  },
  externals: [
    'ws',
  ],
};
