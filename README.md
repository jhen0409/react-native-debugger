# React Native Debugger

[![Backers on Open Collective](https://opencollective.com/react-native-debugger/backers/badge.svg)](#backers) [![Sponsors on Open Collective](https://opencollective.com/react-native-debugger/sponsors/badge.svg)](#sponsors) [![CI Status](https://github.com/jhen0409/react-native-debugger/workflows/CI/badge.svg)](https://github.com/jhen0409/react-native-debugger)

⚠️ This app is currently only supported old [Remote Debugger](https://reactnative.dev/docs/debugging#chrome-developer-tools), if you're looking for new debugger support (e.g. Hermes / JSI / New Architecture) of React Native Debugger, please follow [discussion#774](https://github.com/jhen0409/react-native-debugger/discussions/774).

![React Native Debugger](https://user-images.githubusercontent.com/3001525/29451479-6621bf1a-83c8-11e7-8ebb-b4e98b1af91c.png)

> Run the redux example of [react-navigation](https://github.com/react-navigation/react-navigation/tree/master/example) with Redux DevTools setup

This is a standalone app for debugging React Native apps:

- Based on official [Remote Debugger](https://reactnative.dev/docs/debugging#chrome-developer-tools) and provide more functionality.
- Includes [React Inspector](docs/react-devtools-integration.md) from [`react-devtools-core`](https://github.com/facebook/react/tree/master/packages/react-devtools-core).
- Includes Redux DevTools, made [the same API](docs/redux-devtools-integration.md) with [`redux-devtools-extension`](https://github.com/reduxjs/redux-devtools/tree/main/extension).
- Includes [Apollo Client DevTools](docs/apollo-client-devtools-integration.md) ([`apollographql/apollo-client-devtools`](https://github.com/apollographql/apollo-client-devtools)) as devtools extension.

## Installation

To install the app, you can download a prebuilt binary from the [release page](https://github.com/jhen0409/react-native-debugger/releases).

For **macOS**, you can use [Homebrew Cask](https://caskroom.github.io) to install:

### < Homebrew 2.6.0

```bash
brew update && brew install --cask react-native-debugger
```

### >= Homebrew 2.6.0

```bash
brew install --cask react-native-debugger
```

This puts `React Native Debugger.app` in your `/applications/` folder.

### NOTICE: React Native Compatibility

To use this app you need to ensure you are using the correct version of React Native Debugger and react-native:

| React Native Debugger | react-native |
| --------------------- | ------------ |
| >= 0.11               | >= 0.62      |
| <= 0.10               | <= 0.61      |

We used different auto-update feed for `v0.10` and `v0.11`, so you won't see update tips of `v0.11` from `v0.10`.

Install last release of v0.10 (0.10.7)

### < Homebrew 2.6.0

`brew update && brew cask install https://raw.githubusercontent.com/Homebrew/homebrew-cask/b6ac3795c1df9f97242481c0817b1165e3e6306a/Casks/react-native-debugger.rb`

### >= Homebrew 2.6.0

`brew install --cask https://raw.githubusercontent.com/Homebrew/homebrew-cask/b6ac3795c1df9f97242481c0817b1165e3e6306a/Casks/react-native-debugger.rb`

### Arch-based distributions

You can install [react-native-debugger-bin][1] from Arch User Repository:

```shell
git clone https://aur.archlinux.org/react-native-debugger-bin.git
cd react-native-debugger-bin
makepkg -si

# or using AUR helper
paru -S react-native-debugger-bin
```

## Build from source

Please read [Development section](docs/contributing.md#development) in docs/contributing.md for how to build the app from source.

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

## Documentation (v0.10)

Please visit [`v0.10 branch`](https://github.com/jhen0409/react-native-debugger/tree/v0.10).

## Credits

- Great work of [React DevTools](https://github.com/facebook/react/tree/master/packages/react-devtools)
- Great work of [Redux DevTools](https://github.com/gaearon/redux-devtools) / [Remote Redux DevTools](https://github.com/zalmoxisus/remote-redux-devtools) and all third-party monitors.
- Great work of [Apollo Client DevTools](https://github.com/apollographql/apollo-client-devtools)). (Special thanks to [@Gongreg](https://github.com/Gongreg) for integrating this!)

## Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/react-native-debugger#backer)]

<a href="https://opencollective.com/react-native-debugger#backers" target="_blank"><img src="https://opencollective.com/react-native-debugger/backers.svg?width=890"></a>

## Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/react-native-debugger#sponsor)]

<a href="https://opencollective.com/react-native-debugger#backers" target="_blank"><img src="https://opencollective.com/react-native-debugger/sponsors.svg?width=890"></a>

## LICENSE

[MIT](LICENSE.md)

[1]: https://aur.archlinux.org/packages/react-native-debugger-bin
