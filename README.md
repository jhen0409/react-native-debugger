# React Native Debugger

[![Backers on Open Collective](https://opencollective.com/react-native-debugger/backers/badge.svg)](#backers) [![Sponsors on Open Collective](https://opencollective.com/react-native-debugger/sponsors/badge.svg)](#sponsors) [![CI Status](https://github.com/jhen0409/react-native-debugger/workflows/CI/badge.svg)](https://github.com/jhen0409/react-native-debugger) [![Dependency Status](https://david-dm.org/jhen0409/react-native-debugger.svg)](https://david-dm.org/jhen0409/react-native-debugger) [![devDependency Status](https://david-dm.org/jhen0409/react-native-debugger/dev-status.svg)](https://david-dm.org/jhen0409/react-native-debugger?type=dev)

![React Native Debugger](https://user-images.githubusercontent.com/3001525/29451479-6621bf1a-83c8-11e7-8ebb-b4e98b1af91c.png)

> Run the redux example of [react-navigation](https://github.com/react-navigation/react-navigation/tree/master/examples) with Redux DevTools setup

This is a standalone app for debugging React Native apps:

- Based on official [Remote Debugger](https://facebook.github.io/react-native/docs/debugging.html#chrome-developer-tools) and provide more functionally.
- Includes [React Inspector](docs/react-devtools-integration.md) from [`react-devtools-core`](https://github.com/facebook/react-devtools/tree/master/packages/react-devtools-core).
- Includes Redux DevTools, made [the same API](docs/redux-devtools-integration.md) with [`redux-devtools-extension`](https://github.com/zalmoxisus/redux-devtools-extension).

## Installation

To install the app, you can download a prebuilt binary from the [release page](https://github.com/jhen0409/react-native-debugger/releases).

For **macOS**, you can use [Homebrew Cask](https://caskroom.github.io) to install:

```bash
$ brew update && brew cask install react-native-debugger
```

This puts `React Native Debugger.app` in your `/applications/` folder.

## Documentation

- [Getting Started](docs/getting-started.md)
- [Debugger Integration](docs/debugger-integration.md)
- [React DevTools Integration](docs/react-devtools-integration.md)
- [Redux DevTools Integration](docs/redux-devtools-integration.md)
- [Apollo Client DevTools Integration](docs/apollo-client-devtools-integration.md)
- [Shortcut references](docs/shortcut-references.md)
- [Network inspect of Chrome Developer Tools](docs/network-inspect-of-chrome-devtools.md)
- [Enable open in editor in console](docs/enable-open-in-editor-in-console.md)
- [Config file in home directory](docs/config-file-in-home-directory.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Contributing](docs/contributing.md)

## Credits

- Great work of [React DevTools](https://github.com/facebook/react-devtools)
- Great work of [Redux DevTools](https://github.com/gaearon/redux-devtools) / [Remote Redux DevTools](https://github.com/zalmoxisus/remote-redux-devtools) and all third-party monitors.

## Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/react-native-debugger#backer)]

<a href="https://opencollective.com/react-native-debugger#backers" target="_blank"><img src="https://opencollective.com/react-native-debugger/backers.svg?width=890"></a>

## Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/react-native-debugger#sponsor)]

<a href="https://opencollective.com/react-native-debugger#backers" target="_blank"><img src="https://opencollective.com/react-native-debugger/sponsors.svg?width=890"></a>

## LICENSE

[MIT](LICENSE.md)
