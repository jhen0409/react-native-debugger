# React Native Debugger

[![Build Status](https://travis-ci.org/jhen0409/react-native-debugger.svg?branch=master)](https://travis-ci.org/jhen0409/react-native-debugger) [![Build status Windows](https://ci.appveyor.com/api/projects/status/botj7b3pj4hth6tn/branch/master?svg=true)](https://ci.appveyor.com/project/jhen0409/react-native-debugger) [![Dependency Status](https://david-dm.org/jhen0409/react-native-debugger.svg)](https://david-dm.org/jhen0409/react-native-debugger) [![devDependency Status](https://david-dm.org/jhen0409/react-native-debugger/dev-status.svg)](https://david-dm.org/jhen0409/react-native-debugger?type=dev)

![React Native Debugger](https://user-images.githubusercontent.com/3001525/29451479-6621bf1a-83c8-11e7-8ebb-b4e98b1af91c.png)

> Run the redux example of [react-navigation](https://github.com/react-community/react-navigation/tree/master/examples/ReduxExample) with Redux DevTools setup

This is a standalone app for debugging React Native apps:

* Based on official [Remote Debugger](https://facebook.github.io/react-native/docs/debugging.html#chrome-developer-tools) and provide [more functionally](docs/debugger-integration.md).
* Includes [React Inspector](docs/react-devtools-integration.md) from [`react-devtools-core`](https://github.com/facebook/react-devtools/tree/master/packages/react-devtools-core).
* Includes Redux DevTools, made [the same API](docs/redux-devtools-integration.md) with [`redux-devtools-extension`](https://github.com/zalmoxisus/redux-devtools-extension).

## Installation

The prebuilt binaries can be found on the [releases](https://github.com/jhen0409/react-native-debugger/releases) page.

For __macOS__, you can use [Homebrew Cask](http://caskroom.io) to install:

```bash
$ brew update && brew cask install react-native-debugger
```

## Documentation

* [Getting Started](docs/getting-started.md)
* [Debugger Integration](docs/debugger-integration.md)
* [React DevTools Integration](docs/react-devtools-integration.md)
* [Redux DevTools Integration](docs/redux-devtools-integration.md)
* [Shortcut references](docs/shortcut-references.md)
* [Network inspect of Chrome Developer Tools](docs/network-inspect-of-chrome-devtools.md)
* [Enable open in editor in console](docs/enable-open-in-editor-in-console.md)
* [Troubleshooting](docs/troubleshooting.md)
* [Contributing](docs/contributing.md)

## Credits

* Great work of [React DevTools](https://github.com/facebook/react-devtools)
* Great work of [Redux DevTools](https://github.com/gaearon/redux-devtools) / [Remote Redux DevTools](https://github.com/zalmoxisus/remote-redux-devtools) and all third-party monitors.

## LICENSE

[MIT](LICENSE.md)
