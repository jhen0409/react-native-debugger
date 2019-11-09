import fs from 'fs';
import path from 'path';
import LodashModuleReplacementPlugin from 'lodash-webpack-plugin';
import electronPkg from 'electron/package.json';

const babelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../.babelrc'), 'utf-8'));
// Webpack 2 have native import / export support
babelConfig.presets = [
  [
    'env',
    {
      targets: { electron: electronPkg.version },
      modules: false,
    },
  ],
  'react',
];
babelConfig.babelrc = false;

export default {
  output: {
    path: path.join(__dirname, '../dist/js'),
    filename: 'bundle.js',
    libraryTarget: 'commonjs2',
  },
  plugins: [new LodashModuleReplacementPlugin()],
  resolve: {
    extensions: ['.mjs', '.js'],
    alias: {
      // From remotedev-app, but currently we don't need this
      'socketcluster-client': path.resolve(__dirname, 'mock-socketcluster-client'),
    },
  },
  module: {
    rules: [
      // https://github.com/graphql/graphql-js#using-in-a-browser
      {
        test: /\.mjs$/,
        include: /node_modules\/graphql/,
        type: 'javascript/auto',
      },
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            query: babelConfig,
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  externals: [
    'react-devtools-core/standalone',
    // https://github.com/sindresorhus/conf/blob/master/index.js#L13
    'electron-store',
    'adbkit',
    'electron-named-image',
  ],
};
