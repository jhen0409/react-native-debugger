# React DevTools integration

The React DevTools is used [`react-devtools-core/standalone`](https://github.com/facebook/react-devtools/tree/master/packages/react-devtools-core#requirereact-devtools-corestandalone), this is same with [`Nuclide`](https://github.com/facebook/nuclide), it will open a WebSocket server (port: `8097`) to waiting React Native connection.

## Specified features for React Native

#### React Native Style Editor

* Native styler
* Layout inspect (RN ^0.43 support)

<img width="311" alt="t" src="https://cloud.githubusercontent.com/assets/3001525/25572751/f8477afe-2e70-11e7-9a17-17a4f48436aa.png">

#### Show component source in editor

It's support Atom, Subline, VSCode for macOS.

<img width="276" alt="tt" src="https://cloud.githubusercontent.com/assets/3001525/25572822/a83fdafa-2e71-11e7-8093-cce3f7db98c0.png">

If you want to enable this feature, you need include [`babel-plugin-transform-react-jsx-source`](https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-react-jsx-source) in `.babelrc` of your project, see also [this section](https://github.com/facebook/react-devtools#displaying-element-souce) of `react-devtools`.

## Inspect elements

See the section [`Integration with React Native Inspector`](https://github.com/facebook/react-devtools/tree/master/packages/react-devtools#integration-with-react-native-inspector) from `react-devtools` for more information.

## How to use it with real device?

* If you're debugging via Wi-Fi, you need to edit `setupDevtools.js` of React Native, change `'localhost'` to your machine IP.
  - `<= 0.30` - [Change `localhost` of `Libraries/Devtools/setupDevtools.js#L17`](https://github.com/facebook/react-native/blob/bd60d828c5fc9cb066e5f647c87ecd6f70cb63a5/Libraries/Devtools/setupDevtools.js#L17)
  - `>= 0.31` - [Add `hostname = 'your IP'` to next line of `Libraries/Devtools/setupDevtools.js#L20-L23`](https://github.com/facebook/react-native/blob/46417dd26a4ab247d59ad147fdfe1655cb23edf9/Libraries/Devtools/setupDevtools.js#L20-L23)
  - `>= 0.37` - [The same as above, but the path is changed to `Libraries/Core/Devtools/setupDevtools.js#L20-L23`](https://github.com/facebook/react-native/blob/292cc82d0ebc437a6f1cdd2e972b3917b7ee05a4/Libraries/Core/Devtools/setupDevtools.js#L20-L23)
  - `>= 0.43` - [Change `host` of `Libraries/Core/Devtools/setupDevtools.js#L28-L30`](https://github.com/facebook/react-native/blob/0.43-stable/Libraries/Core/Devtools/setupDevtools.js)

## Get `$r` global variable of React Native runtime in the console

Refer to [`Debugger Integration`](debugger-integration.md#debugging-tips).
