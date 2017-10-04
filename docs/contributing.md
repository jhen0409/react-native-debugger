# Contributing

## Development

### Fork this repo & install dependencies

We're recommended use yarn because we keep the dependencies lock of yarn.

```bash
# In react-native-debugger directory
$ yarn
$ cd npm-package && yarn && cd ..
```

If you want to debug the [NPM package](../npm-package), just run `npm link <the package path>` on your React Native project.

### Run on development mode

```bash
$ yarn dev:webpack  # Then open the another terminal tab
$ yarn dev:electron
```

Please ensure the `React Native Debugger` production app is closed.

### Run on production mode

```bash
$ yarn build
$ yarn start
```

### Run test

Run lint and test, currently we just wrote E2E test for RNDebugger.

```bash
$ yarn lint
$ yarn test
```

You need to closes all React Native packager (make sure `8081` or `8088` port not listening) when running the test.

### Packaging app

```bash
$ yarn run pack-macos
$ yarn run pack-linux
$ yarn run pack-windows
$ yarn run pack # all
```

If you want to build binaries yourself, please remove [../electron/update.js](electron/update.js) (and [electon/main.js usage](electon/main.js)), `osx-sign` in [../scripts/package-macos.sh](scripts/package-macos.sh).

## Other documentations

* [Getting Started](getting-started.md)
* [Debugger Integration](debugger-integration.md)
* [React DevTools Integration](react-devtools-integration.md)
* [Redux DevTools Integration](redux-devtools-integration.md)
* [Shortcut references](shortcut-references.md)
* [Network inspect of Chrome Developer Tools](network-inspect-of-chrome-devtools.md)
* [Enable open in editor in console](enable-open-in-editor-in-console.md)
* [Troubleshooting](troubleshooting.md)
