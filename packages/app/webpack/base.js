const path = require('path')
const electronPkg = require('electron/package.json')
const babelConfig = require('../babel.config')({ cache: () => {} })

// Webpack 2 have native import / export support
babelConfig.presets = [
  [
    '@babel/preset-env',
    {
      targets: { electron: electronPkg.version },
      modules: false,
    },
  ],
  '@babel/preset-react',
]
babelConfig.babelrc = false

module.exports = {
  output: {
    path: path.join(__dirname, '../dist/js'),
    filename: 'bundle.js',
    libraryTarget: 'commonjs2',
  },
  plugins: [],
  resolve: {
    extensions: ['.js'],
    alias: {},
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: babelConfig,
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
}
