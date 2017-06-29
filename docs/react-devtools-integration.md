# React DevTools Integration

The React DevTools is built by [`react-devtools-core/standalone`](https://github.com/facebook/react-devtools/tree/master/packages/react-devtools-core#requirereact-devtools-corestandalone), this is same with element inspector of [`Nuclide`](https://nuclide.io/docs/platforms/react-native/#debugging__element-inspector), it will open a WebSocket server to waiting React Native connection.

__*NOTE*__ The server will listen a random port and inject `window.__REACT_DEVTOOLS_PORT__` global variable in debugger worker, the port is only works with React Native version ^0.39, it will fallback to `8097` (default port) if you're using React Native version under 0.39.

For Android, we have the built-in `adb` util and it will reverse the port automatically.

## Specified features for React Native

#### React Native Style Editor

* Native styler
* Layout inspect (RN ^0.43 support)

<img width="288" alt="2017-05-27 12 00 36" src="https://cloud.githubusercontent.com/assets/3001525/26518163/0dc24ea6-42dd-11e7-91aa-52da5c4d347d.png">

#### Show component source in editor

It's support Atom, Subline, VSCode for macOS.

<img width="276" alt="tt" src="https://cloud.githubusercontent.com/assets/3001525/25572822/a83fdafa-2e71-11e7-8093-cce3f7db98c0.png">

## Inspect elements

You can read the section [`Integration with React Native Inspector`](https://github.com/facebook/react-devtools/tree/master/packages/react-devtools#integration-with-react-native-inspector) from README of `react-devtools`, we have the same usage with the package.

## How to use it with real device?

* If you're debugging via Wi-Fi, you need to edit `setupDevtools.js` of React Native, change `'localhost'` to your machine IP.
  - `<= 0.30` - [Change `localhost` of `Libraries/Devtools/setupDevtools.js#L17`](https://github.com/facebook/react-native/blob/bd60d828c5fc9cb066e5f647c87ecd6f70cb63a5/Libraries/Devtools/setupDevtools.js#L17)
  - `>= 0.31` - [Add `hostname = 'your IP'` to next line of `Libraries/Devtools/setupDevtools.js#L20-L23`](https://github.com/facebook/react-native/blob/46417dd26a4ab247d59ad147fdfe1655cb23edf9/Libraries/Devtools/setupDevtools.js#L20-L23)
  - `>= 0.37` - [The same as above, but the path is changed to `Libraries/Core/Devtools/setupDevtools.js#L20-L23`](https://github.com/facebook/react-native/blob/292cc82d0ebc437a6f1cdd2e972b3917b7ee05a4/Libraries/Core/Devtools/setupDevtools.js#L20-L23)
  - `>= 0.43` - [Change `host` of `Libraries/Core/Devtools/setupDevtools.js#L28-L30`](https://github.com/facebook/react-native/blob/0.43-stable/Libraries/Core/Devtools/setupDevtools.js)

## Get `$r` global variable of React Native runtime in the console

Refer to [`Debugger Integration`](debugger-integration.md#debugging-tips).
