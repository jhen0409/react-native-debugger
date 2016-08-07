# React Native Debugger

[![Build Status](https://travis-ci.org/jhen0409/react-native-debugger.svg?branch=master)](https://travis-ci.org/jhen0409/react-native-debugger) [![Build status Windows](https://ci.appveyor.com/api/projects/status/botj7b3pj4hth6tn?svg=true)](https://ci.appveyor.com/project/jhen0409/react-native-debugger) [![Dependency Status](https://david-dm.org/jhen0409/react-native-debugger.svg)](https://david-dm.org/jhen0409/react-native-debugger) [![devDependency Status](https://david-dm.org/jhen0409/react-native-debugger/dev-status.svg)](https://david-dm.org/jhen0409/react-native-debugger?type=dev)

> The standalone app for React Native Debugger, with React DevTools / Redux DevTools

## Screenshot

![React Native Debugger](https://cloud.githubusercontent.com/assets/3001525/15636231/9e47d322-262a-11e6-8326-9a05fc73adec.png)

## Installation

The prebuilt binaries can be found on the [releases](https://github.com/jhen0409/react-native-debugger/releases) page.

For __macOS__, you can use [Homebrew Cask](http://caskroom.io) to install:

```bash
$ brew update && brew cask install react-native-debugger
```

## Usage

You must make sure all `http://localhost:8081/debugger-ui` pages are closed, then open the app to wait state, and reload JS with your simulator / device.

Also, you can use [react-native-debugger-open](https://github.com/jhen0409/react-native-debugger/blob/master/patch), it will replace `open debugger-ui with Chrome` to `open React Native Debugger` from react-native packager.

#### Platform support

* [React Native](https://github.com/facebook/react-native) >= 0.21.0
* [React Native Desktop](https://github.com/ptmt/react-native-desktop) >= 0.8.7

## Debugger

The Debugger part is reference from [react-native](https://github.com/facebook/react-native/blob/master/local-cli/server/util/) debugger-ui.

## React DevTools

The React Developer Tools part from [react-devtools/shells/electron](https://github.com/facebook/react-devtools/tree/master/shells/electron), it will open a WebSocket server (port: `8097`) to waiting React Native connection.

If you're debugging with a real device, you need to edit [node_modules/react-native/Libraries/Devtools/setupDevtools.js](https://github.com/facebook/react-native/tree/master/Libraries/Devtools/setupDevtools.js#L17).

#### Get $r or global variables of react-native runtime in the console

You need to switch worker thread for console, open `Sources` tab on Chrome DevTools, and select `debugger.worker.js` in `Threads`.

#### Note for Android

The React DevTools are working directly on React Native ^0.30, for old versions, you need to add the following code:

```js
if (__DEV__) {
  require('react-native/Libraries/Devtools/setupDevtools')();
}
```

And run `adb reverse tcp:8097 tcp:8097` on your terminal. (For emulator, RN ^0.31 is not need `adb reverse`)

## Redux DevTools

We used [remotedev-app](https://github.com/zalmoxisus/remotedev-app) as a Redux DevTools UI, but it not need `remotedev-server`. That was great because it included multiple monitors and there are many powerful features.

The debugger will inject `reduxNativeDevTools` enhancer to global, you can add it to store:

```js
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import reducer from '../reducers';

export default initialState => {
  const enhancer = compose(
    applyMiddleware(thunk),
    global.reduxNativeDevTools ? global.reduxNativeDevTools(/*options*/) : nope => nope,
  );
  const store = createStore(reducer, initialState, enhancer);
  // If you have other enhancers & middlewares
  // update the store after creating / changing to allow devTools to use them
  if (global.reduxNativeDevTools) {
    global.reduxNativeDevTools.updateStore(store);
  }
  return store;
}
```

#### Options

Name                  | Description
-------------         | -------------
`filters`             | *Map of arrays* named `whitelist` or `blacklist` to filter action types.
`maxAge`              | *Number* of maximum allowed actions to be stored on the history tree, the oldest actions are removed once maxAge is reached. Default is `30`.
`actionCreators`      | *Array* or *Object* of action creators to dispatch remotely. See the [example](https://github.com/zalmoxisus/remote-redux-devtools/commit/b54652930dfd4e057991df8471c343957fd7bff7).

These options are same with [remote-redux-devtools#parameters](https://github.com/zalmoxisus/remote-redux-devtools#parameters).

## Development

```bash
# Just clone it
$ git clone https://github.com/jhen0409/react-native-debugger
$ cd react-native-debugger && npm install
$ npm run fetch-rdt # Fetch react-devtools source

# Run on development
$ npm run dev:webpack
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

## Credits

* Great work of [React DevTools](https://github.com/facebook/react-devtools)
* Great work of [Redux DevTools](https://github.com/gaearon/redux-devtools) / [Remote Redux DevTools](https://github.com/zalmoxisus/remote-redux-devtools) and all third-party monitors.

## LICENSE

[MIT](LICENSE.md)
