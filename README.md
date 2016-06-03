# React Native Debugger [![Build Status](https://travis-ci.org/jhen0409/react-native-debugger.svg?branch=master)](https://travis-ci.org/jhen0409/react-native-debugger)

> The standalone app for React Native Debugger, with React DevTools / Redux DevTools

## Screenshot

![React Native Debugger](https://cloud.githubusercontent.com/assets/3001525/15636231/9e47d322-262a-11e6-8326-9a05fc73adec.png)

## Usage

The prebuilt binaries can be found on the [releases](https://github.com/jhen0409/react-native-debugger/releases) page, currently only for OS X.

You can use [Homebrew Cask](http://caskroom.io) to install:

```bash
$ brew update && brew cask install react-native-debugger
```

Make sure all `http://localhost:8081/debugger-ui` pages is closed, open the app to wait state, and reload JS with your simulator/device.

Also, you can use [react-native-debugger-open](https://github.com/jhen0409/react-native-debugger/blob/master/patch), it will replace `open debugger-ui with Chrome` to `open React Native Debugger` from react-native packager.

## Debugger

This is reference to [react-native](https://github.com/facebook/react-native/blob/master/local-cli/server/util/) debugger-ui.

## React DevTools

This is reference to [react-devtools/shells/electron](https://github.com/facebook/react-devtools/tree/master/shells/electron), it will open a websocket server (port: 8097) to waiting react-native connection.

If you're debugging with a real device, you need to edit [node_modules/react-native/Libraries/Devtools/setupDevtools.js](https://github.com/facebook/react-native/tree/master/Libraries/Devtools/setupDevtools.js#L17).

__*NOTE*__ Currently only for iOS, see [this](https://github.com/facebook/react-native/blob/master/Libraries/JavaScriptAppEngine/Initialization/InitializeJavaScriptAppEngine.js#L216).

## Redux DevTools

We used [remotedev-app](https://github.com/zalmoxisus/remotedev-app) as a Redux DevTools UI, and not need `remotedev-server`. That was great because it included multiple monitors and there are many powerful features.

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
  return createStore(reducer, initialState, enhancer);
}
```

#### Options

Name                  | Description
-------------         | -------------
`filters`             | *Map of arrays* named `whitelist` or `blacklist` to filter action types.
`maxAge`              | *Number* of maximum allowed actions to be stored on the history tree, the oldest actions are removed once maxAge is reached. Default is `30`.

These two option is same with [remote-redux-devtools#parameters](https://github.com/zalmoxisus/remote-redux-devtools#parameters).

## Development

```bash
# Just clone it
$ git clone https://github.com/jhen0409/react-native-debugger
$ cd react-native-debugger && npm install

# Run on development
$ npm run dev:webpack
$ npm run dev:electron

# Run on production
$ npm run build
$ npm start

# Pack (Currently will pack OSX version only)
$ npm run pack
```

## Credits

* Great work of [React DevTools](https://github.com/facebook/react-devtools)
* Great work of [Redux DevTools](https://github.com/gaearon/redux-devtools) / [Remote Redux DevTools](https://github.com/zalmoxisus/remote-redux-devtools) and all third-party monitors.

## LICENSE

[MIT](LICENSE.md)
