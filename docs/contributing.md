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
_Please ensure the `React Native Debugger` production / distribution app is closed._

```bash
$ yarn dev:webpack  # Then open the another terminal tab
$ yarn dev:electron
```
1. From here, you can open a react-native project with remote debugging enabled. 
1. To see the development build of the react-native-debugger, do x,y,z

### Run on production mode

```bash
$ yarn build
$ yarn start
```

### Run test

Run lint and test, currently we just wrote E2E test for RNDebugger.

```bash
$ yarn test
$ yarn test-e2e
```

You need to closes all React Native packager (make sure `8081` or `8088` port not listening) when running the test.

### Packaging app

```bash
$ yarn run pack-macos
# On macOS: brew install fakeroot dpkg rpm
$ yarn run pack-linux
# On macOS: brew install wine mono
$ yarn run pack-windows
$ yarn run pack # all
```

If you want to build binaries yourself, please remove [../electron/update.js](electron/update.js) (and [electon/main.js usage](electon/main.js)), `osx-sign` in [../scripts/package-macos.sh](scripts/package-macos.sh).

## Financial contributions

We also welcome financial contributions in full transparency on our [open collective](https://opencollective.com/react-native-debugger).
Anyone can file an expense. If the expense makes sense for the development of the community, it will be "merged" in the ledger of our open collective by the core contributors and the person who filed the expense will be reimbursed.

## Credits

### Contributors

Thank you to all the people who have already contributed to react-native-debugger!

### Backers

Thank you to all our backers! [[Become a backer](https://opencollective.com/react-native-debugger#backer)]

<a href="https://opencollective.com/react-native-debugger#backers" target="_blank"><img src="https://opencollective.com/react-native-debugger/backers.svg?width=890"></a>

### Sponsors

Thank you to all our sponsors! (please ask your company to also support this open source project by [becoming a sponsor](https://opencollective.com/react-native-debugger#sponsor))

<a href="https://opencollective.com/react-native-debugger#backers" target="_blank"><img src="https://opencollective.com/react-native-debugger/sponsors.svg?width=890"></a>

## Other documentations

- [Getting Started](getting-started.md)
- [Debugger Integration](debugger-integration.md)
- [React DevTools Integration](react-devtools-integration.md)
- [Redux DevTools Integration](redux-devtools-integration.md)
- [Apollo Client DevTools Integration](apollo-client-devtools-integration.md)
- [Shortcut references](shortcut-references.md)
- [Network inspect of Chrome Developer Tools](network-inspect-of-chrome-devtools.md)
- [Enable open in editor in console](enable-open-in-editor-in-console.md)
- [Config file in home directory](config-file-in-home-directory.md)
- [Troubleshooting](troubleshooting.md)
