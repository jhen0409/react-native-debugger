# react-native-debugger-patch

> Replace `open debugger-ui with Chrome` to `open React Native Debugger` from react-native packager

__*NOTE*__ This patch is only work with `react-native-debugger@^0.2.0`.

## Installation

First, install [React Native Debugger](https://github.com/jhen0409/react-native-debugger#usage).

In your React Native project:

```bash
$ npm i --save-dev react-native-debugger-patch
```

## Usage

Add command to your project's package.json:

```
"scripts": {
  "postinstall": "rndebugger-patch"
}
```

It will be run after `npm install`. (You can run `npm run postinstall` first)

If you want to revert injection, just run:

```bash
$ $(npm bin)/rndebugger-patch --revert
```

You can also use following command instead of this patch:

```bash
# OS X
$ open "rndebugger://set-debugger-loc?host=localhost&port=8082"
```

## LICENSE

[MIT](https://github.com/jhen0409/react-native-debugger/blob/master/LICENSE.md)
