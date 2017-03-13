import fs from 'fs';
import { join } from 'path';

const babelConfig = JSON.parse(
  fs.readFileSync(join(__dirname, '../.babelrc'), 'utf-8')
);
// Webpack 2 have native import / export support
babelConfig.presets = [
  ['env', { targets: { node: 7.6 }, modules: false }],
  'react',
];
babelConfig.babelrc = false;

export default {
  output: {
    path: join(__dirname, '../dist/js'),
    filename: 'bundle.js',
    libraryTarget: 'commonjs2',
  },
  plugins: [
  ],
  resolve: {
    extensions: ['.js'],
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: [{
        loader: 'babel-loader',
        query: babelConfig,
      }],
      exclude: /node_modules/,
    }],
  },
  externals: [
    'react-devtools-core/standalone',
    // just avoid warning.
    // this is not really used from ws. (it used fallback)
    'utf-8-validate', 'bufferutil',
    // https://github.com/sindresorhus/conf/blob/master/index.js#L13
    'electron-config',
  ],
};
