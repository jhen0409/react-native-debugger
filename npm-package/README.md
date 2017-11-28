# react-native-debugger-open [![NPM version](http://img.shields.io/npm/v/react-native-debugger-open.svg?style=flat)](https://www.npmjs.com/package/react-native-debugger-open)

> Replace `open debugger-ui with Chrome` to `open React Native Debugger` from react-native packager

__[macOS]__ If you opened the app before (registered URI scheme), you can use this patch open the app automatically.
__[Linux / Windows]__ Currently it cannot open the app automatically, it just send `set-debugger-loc` request, so you need open the app yourself.

## Screenshot

![demo](https://user-images.githubusercontent.com/3001525/31390358-490eb22a-ad99-11e7-9d1a-65b4d185e261.gif)

> Demo with initial project of Create React Native App (Expo)

## Installation

First, install [React Native Debugger](https://github.com/jhen0409/react-native-debugger#installation).

In your React Native project:

```bash
$ npm i --save-dev react-native-debugger-open # or -g
```

## Usage

#### Inject to react-native packager

Add command to your project's package.json:

```
"scripts": {
  "postinstall": "rndebugger-open"
}
```

It will be run after `npm install`. (You can run `npm run postinstall` first)
The `./node_modules/react-native/local-cli/server/middleware/getDevToolsMiddleware.js` code will be replaced.

#### Use `REACT_DEBUGGER` env of react-native packager

Instead of `Inject to react-native packager`, you can just do:

```bash
$ REACT_DEBUGGER="rndebugger-open --open --port 8081" npm start

# Windows
$ set REACT_DEBUGGER="rndebugger-open --open --port 8081" && npm start
```

#### Options (--option)

Name                  | Description
-------------         | -------------
`macos`               | Use [react-native-macos](https://github.com/ptmt/react-native-macos) module name instead of react-native. Default is `false`
`revert`              | Revert rndebugger-open injection. Default is `false`
`open`                | Run open directly instead of inject patch
`port`                | Specified react-native packager port with `--open` option. Default is `8081`
`expo`                | Use [Expo](https://github.com/expo)'s RN packager port if you're not specified port.

You can also [`Launch by CLI or React Native packager`](https://github.com/jhen0409/react-native-debugger/blob/master/docs/getting-started.md#launch-by-cli-or-react-native-packager-macos-only) instead of this package.

## LICENSE

[MIT](https://github.com/jhen0409/react-native-debugger/blob/master/LICENSE.md)
