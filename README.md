# React Native Debugger

[![Build Status](https://travis-ci.org/jhen0409/react-native-debugger.svg?branch=master)](https://travis-ci.org/jhen0409/react-native-debugger) [![Build status Windows](https://ci.appveyor.com/api/projects/status/botj7b3pj4hth6tn?svg=true)](https://ci.appveyor.com/project/jhen0409/react-native-debugger) [![Dependency Status](https://david-dm.org/jhen0409/react-native-debugger.svg)](https://david-dm.org/jhen0409/react-native-debugger) [![devDependency Status](https://david-dm.org/jhen0409/react-native-debugger/dev-status.svg)](https://david-dm.org/jhen0409/react-native-debugger?type=dev)

![React Native Debugger](https://cloud.githubusercontent.com/assets/3001525/15636231/9e47d322-262a-11e6-8326-9a05fc73adec.png)

This is a standalone app for debugging React Native apps, it's based on the official [Remote Debugger](https://facebook.github.io/react-native/docs/debugging.html#chrome-developer-tools), and includes React Inspector / Redux DevTools.

## Installation

The prebuilt binaries can be found on the [releases](https://github.com/jhen0409/react-native-debugger/releases) page.

For __macOS__, you can use [Homebrew Cask](http://caskroom.io) to install:

```bash
$ brew update && brew cask install react-native-debugger
```

## Usage

You must make sure all `http://localhost:8081/debugger-ui` pages are closed, then open the app to wait state, and reload JS with your simulator / device.

Also, you can use [react-native-debugger-open](https://github.com/jhen0409/react-native-debugger/blob/master/patch), it can:

* Replace `open debugger-ui with Chrome` to `open React Native Debugger` from react-native packager, saving you from closing the debugger-ui page everytime it automatically opens :)
* Detect react-native packager port then send to the app, if you launch packager with custom `--port`, this will very useful

#### Platform support

* [React Native](https://github.com/facebook/react-native) >= 0.21.0
* [React Native for macOS](https://github.com/ptmt/react-native-desktop) (formerly react-native-desktop) >= 0.8.7
* [React Native for Windows](https://github.com/ReactWindows/react-native-windows/blob/master/Libraries/Devtools/setupDevtools.windows.js) (need to remove [setupDevtools.windows.js](https://github.com/ReactWindows/react-native-windows/blob/master/Libraries/Devtools/setupDevtools.windows.js))

## Debugger

The Debugger part is referenced from [react-native](https://github.com/facebook/react-native/blob/master/local-cli/server/util/) debugger-ui.

## React Inspector

The React Inspector is used [`react-devtools-core/standalone`](https://github.com/facebook/react-devtools/tree/master/packages/react-devtools-core#requirereact-devtools-corestandalone), it will open a WebSocket server (port: `8097`) to waiting React Native connection.

#### Use real device

* If you're debugging via WIFI, you need to edit `node_modules/react-native/Libraries/Core/Devtools/setupDevtools.js`, change `'localhost'` to your machine IP.
* [Android only] If you're debugging via USB, you can just run `adb reverse tcp:8097 tcp:8097` on your terminal.

## Redux DevTools (and [RemoteDev on local](https://github.com/zalmoxisus/remotedev) even [MobX](https://github.com/zalmoxisus/mobx-remotedev))

We used [RemoteDev App](https://github.com/zalmoxisus/remotedev-app) and made the API same with [Redux DevTools Extension](https://github.com/zalmoxisus/redux-devtools-extension)!

If you're enabled `Debug JS remotely` with React Native Debugger, the following API is already included in global:

* `window.__REDUX_DEVTOOLS_EXTENSION__`
* `window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__`

See [usage of redux-devtools-extension](https://github.com/zalmoxisus/redux-devtools-extension#usage) for more information.

#### Examples

* [`Redux counter`](https://github.com/jhen0409/react-native-debugger-redux-example)
* [`MobX counter`](https://github.com/jhen0409/react-native-debugger-mobx-example) - with [`mobx-remotedev`](https://github.com/zalmoxisus/mobx-remotedev).

## Debugging tips

#### Get $r of React DevTools or global variables of react-native runtime in the console

You need to switch worker thread for console, open `Console` tab on Chrome DevTools, tap `top` context and change to `RNDebuggerWorker.js` context:

![2016-11-05 6 56 45](https://cloud.githubusercontent.com/assets/3001525/20025024/7edce770-a325-11e6-9e77-618c7ba04123.png)

#### Inpsect network requests by `Network` tab of Chrome DevTools (See also [#15](https://github.com/jhen0409/react-native-debugger/issues/15))

We can do:

```js
// const bakXHR = global.XMLHttpRequest;
// const bakFormData = global.FormData;
global.XMLHttpRequest = global.originalXMLHttpRequest ?
  global.originalXMLHttpRequest :
  global.XMLHttpRequest;
global.FormData = global.originalFormData ?
  global.originalFormData :
  global.FormData;
```

__WARNING__ It will break `NSExceptionDomains` for iOS, because `originalXMLHttpRequest` is from debugger worker (it will replace native request), so we should be clear about the difference in debug mode.

If you want to inspect deeper network requests (Like request of `Image`), use tool like [Stetho](https://facebook.github.io/stetho) will be better.

## Troubleshooting

#### [Android] React Inspector get stuck at "Connecting to React…" ([#45](https://github.com/jhen0409/react-native-debugger/issues/45))

Maybe the problem is related to `requestIdleCallback` API (try to check if it not work on debug mode), make sure the device time is the same as the host (your computer), otherwise:

```js
// Not recommended
if (__DEV__) {
  window.requestIdleCallback = null
  window.cancelIdleCallback = null
}
// Make sure it before call at `import { ... } from 'react-native'`
```

Or use polyfill instead. (Like: [react-devtools/agent/Bridge.js#L21-L22](https://github.com/facebook/react-devtools/blob/master/agent/Bridge.js#L21-L22))

## Development

```bash
# Just clone it
$ git clone https://github.com/jhen0409/react-native-debugger
$ cd react-native-debugger && npm install

# Run on development
$ npm run dev:webpack  # Then open the another 
$ npm run dev:electron

# Run on production
$ npm run build
$ npm start

# Run test
$ npm run lint
$ npm test

# Pack
$ npm run pack-macos
$ npm run pack-linux
$ npm run pack-windows
$ npm run pack # all
```

If you want to build binaries yourself, please remove [electron/update.js](electron/update.js) (and [electon/main.js usage](electon/main.js)), `osx-sign` in [scripts/package-macos.sh](scripts/package-macos.sh).

## Credits

* Great work of [React DevTools](https://github.com/facebook/react-devtools)
* Great work of [Redux DevTools](https://github.com/gaearon/redux-devtools) / [Remote Redux DevTools](https://github.com/zalmoxisus/remote-redux-devtools) and all third-party monitors.

## LICENSE

[MIT](LICENSE.md)
