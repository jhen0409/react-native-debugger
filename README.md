# React Native Debugger

[![Build Status](https://travis-ci.org/jhen0409/react-native-debugger.svg?branch=master)](https://travis-ci.org/jhen0409/react-native-debugger) [![Build status Windows](https://ci.appveyor.com/api/projects/status/botj7b3pj4hth6tn?svg=true)](https://ci.appveyor.com/project/jhen0409/react-native-debugger) [![Dependency Status](https://david-dm.org/jhen0409/react-native-debugger.svg)](https://david-dm.org/jhen0409/react-native-debugger) [![devDependency Status](https://david-dm.org/jhen0409/react-native-debugger/dev-status.svg)](https://david-dm.org/jhen0409/react-native-debugger?type=dev)

![React Native Debugger](https://cloud.githubusercontent.com/assets/3001525/15636231/9e47d322-262a-11e6-8326-9a05fc73adec.png)

This is a standalone app for debugging React Native apps, it's the same with official [Remote Debugger](https://facebook.github.io/react-native/docs/debugging.html#chrome-developer-tools), but we make it as a desktop app, and include React Developer Tools / Redux DevTools.

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
* [React Native for macOS](https://github.com/ptmt/react-native-desktop) (formerly react-native-desktop) >= 0.8.7

## Debugger

The Debugger part is reference from [react-native](https://github.com/facebook/react-native/blob/master/local-cli/server/util/) debugger-ui.

## React DevTools

The React Developer Tools part from [react-devtools/shells/electron](https://github.com/facebook/react-devtools/tree/master/shells/electron), it will open a WebSocket server (port: `8097`) to waiting React Native connection.

If you're debugging with a real device, you need to edit [node_modules/react-native/Libraries/Core/Devtools/setupDevtools.js](https://github.com/facebook/react-native/tree/master/Libraries/Core/Devtools/setupDevtools.js#L17).

#### Note for Android

It can be working directly on React Native ^0.30, for old versions, you need to add the following code:

```js
if (__DEV__) {
  require('react-native/Libraries/Devtools/setupDevtools')();
}
```

And run `adb reverse tcp:8097 tcp:8097` on your terminal. (For emulator, RN ^0.31 isn't need `adb reverse`)

## Redux DevTools

We used [remotedev-app](https://github.com/zalmoxisus/remotedev-app) as a Redux DevTools UI, but it not need `remotedev-server`. That was great because it included multiple monitors and there are many powerful features.

The debugger worker will inject `__REDUX_DEVTOOLS_EXTENSION__` enhancer, `__REDUX_DEVTOOLS_EXTENSION_COMPOSE__` to global, we provide the same name as [redux-devtools-extension](https://github.com/zalmoxisus/redux-devtools-extension), you can add it to store:

#### Basic store

```js
import { createStore, applyMiddleware } from 'redux';

const store = createStore(reducer, initialState, 
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__({/* options */})
);
```

#### Advanced store setup

If you setup your store with [middleware and enhancers](http://redux.js.org/docs/api/applyMiddleware.html), just use `__REDUX_DEVTOOLS_EXTENSION_COMPOSE__` instead of redux `compose`:

```js
import { createStore, applyMiddleware, compose } from 'redux';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducer, preloadedState, composeEnhancers(
  applyMiddleware(...middleware)
));
```

With [options](#options):

```js
import { createStore, applyMiddleware, compose } from 'redux';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({/* options */}) :
  compose;
const store = createStore(reducer, preloadedState, composeEnhancers(
  applyMiddleware(...middleware)
));
```

__*NOTE*__ Old `reduxNativeDevTools` and `reduxNativeDevToolsCompose` can still be used.

#### Use `redux-devtools-extension` package from npm

To make things easier, there's a npm package to install:

```bash
$ npm install --save redux-devtools-extension
```

and to use like that:

```js
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

const store = createStore(reducer, composeWithDevTools(
  applyMiddleware(...middleware),
  // other store enhancers if any
));
```

or if needed to apply [options](#options):

```js
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

const composeEnhancers = composeWithDevTools({
  // Specify here name, actionsBlacklist, actionsCreators and other options
});
const store = createStore(reducer, composeEnhancers(
  applyMiddleware(...middleware),
  // other store enhancers if any
));
```

There’re [just few lines](https://github.com/zalmoxisus/redux-devtools-extension/blob/master/npm-package/index.js) of code.

#### Options

Name                  | Description
-------------         | -------------
`name`                | *String* representing the instance name to be shown on the remote monitor. Default is `{platform os}-{hash id}`.
`filters`             | *Map of arrays* named `whitelist` or `blacklist` to filter action types.
`actionSanitizer`     | *Function* which takes action object and id number as arguments, and should return action object back. See the example bellow.
`stateSanitizer`      | *Function* which takes state object and index as arguments, and should return state object back. See the example bellow.
`maxAge`              | *Number* of maximum allowed actions to be stored on the history tree, the oldest actions are removed once maxAge is reached. Default is `30`.
`actionCreators`      | *Array* or *Object* of action creators to dispatch remotely. See the [example](https://github.com/zalmoxisus/remote-redux-devtools/commit/b54652930dfd4e057991df8471c343957fd7bff7).
`shouldCatchErrors`   | *Boolean* - if specified as `true`, whenever there’s an exception in reducers, the monitors will show the error message, and next actions will not be dispatched.
`shouldHotReload`     | *Boolean* - if set to `false`, will not recompute the states on hot reloading (or on replacing the reducers). Default to `true`.
`shouldRecordChanges` | *Boolean* - if specified as `false`, it will not record the changes till clicked on "Start recording" button on the monitor app. Default is `true`.
`shouldStartLocked`   | *Boolean* - if specified as `true`, it will not allow any non-monitor actions to be dispatched till `lockChanges(false)` is dispatched. Default is `false`.
`pauseActionType`     | *String*  - if specified, whenever clicking on `Pause recording` button and there are actions in the history log, will add this action type. If not specified, will commit when paused. Default is `@@PAUSED`.

## Debugging tips

#### Get $r of React DevTools or global variables of react-native runtime in the console

You need to switch worker thread for console, open `Console` tab on Chrome DevTools, tap `top` context and change to `RNDebuggerWorker.js` context:

![2016-11-05 6 56 45](https://cloud.githubusercontent.com/assets/3001525/20025024/7edce770-a325-11e6-9e77-618c7ba04123.png)

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

If you want to build binaries yourself, please remove [electron/update.js](electron/update.js) (and [electon/main.js usage](electon/main.js)), `osx-sign` in [scripts/package-macos.sh](scripts/package-macos.sh).

## Credits

* Great work of [React DevTools](https://github.com/facebook/react-devtools)
* Great work of [Redux DevTools](https://github.com/gaearon/redux-devtools) / [Remote Redux DevTools](https://github.com/zalmoxisus/remote-redux-devtools) and all third-party monitors.

## LICENSE

[MIT](LICENSE.md)
