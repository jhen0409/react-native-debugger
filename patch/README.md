# react-native-debugger-open

> Replace `open debugger-ui with Chrome` to `open React Native Debugger` from react-native packager

__[macOS]__ If you opened the app before (registered URI scheme), you can use this patch open the app automatically.  
__[Linux / Windows]__ Currently it cannot open the app automatically, it just send `set-debugger-loc` request, so you need open the app yourself.

__*NOTE*__ This patch is only work with React Native Debugger ^0.2.0. __Linux / Windows__ version work with ^0.3.0.

## Screenshot

![demo](https://cloud.githubusercontent.com/assets/3001525/15777379/59a9c654-29c1-11e6-8656-247b8450bc47.gif)

## Installation

First, install [React Native Debugger](https://github.com/jhen0409/react-native-debugger#installation).

In your React Native project:

```bash
$ npm i --save-dev react-native-debugger-open
```

## Usage

Add command to your project's package.json:

```
"scripts": {
  "postinstall": "rndebugger-open"
}
```

It will be run after `npm install`. (You can run `npm run postinstall` first)  
The `./node_modules/react-native/local-cli/server/middleware/getDevToolsMiddleware.js` code will be replaced.

#### Options (--option)

Name                  | Description
-------------         | -------------
`macos`             | Use [react-native-macos](https://github.com/ptmt/react-native-macos) module name instead of react-native. Default is `false`
`revert`              | Revert rndebugger-open injection. Default is `false`

You can also use following command instead of this patch:

```bash
# macOS
$ open "rndebugger://set-debugger-loc?host=localhost&port=8082"
```

## LICENSE

[MIT](https://github.com/jhen0409/react-native-debugger/blob/master/LICENSE.md)
