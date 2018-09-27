# React DevTools Integration

**_NOTE_** Supported React Native version is `>= 0.43`. Please downgrade RNDebugger version to `0.7.20` if you're using older versions of React Native.

The React DevTools is built by [`react-devtools-core/standalone`](https://github.com/facebook/react-devtools/tree/master/packages/react-devtools-core#requirereact-devtools-corestandalone), this is same with element inspector of [`Nuclide`](https://nuclide.io/docs/platforms/react-native/#debugging__element-inspector).

It will open a WebSocket server to waiting React Native connection. The connection already included in React Native (see [`setupDevtools.js`](https://github.com/facebook/react-native/blob/master/Libraries/Core/Devtools/setupDevtools.js)), it will keep trying to connect the React DevTools server in development mode, it should works well without specify anything, unless you need to set the server hostname for [use it with real device](#how-to-use-it-with-real-device).

We made the server listen a random port and inject `window.__REACT_DEVTOOLS_PORT__` global variable in debugger worker.

For Android, we have the built-in `adb` util and it will reverse the port automatically.

## Specified features for React Native

#### React Native Style Editor

- Native styler
- Layout inspect

<img width="288" alt="2017-05-27 12 00 36" src="https://cloud.githubusercontent.com/assets/3001525/26518163/0dc24ea6-42dd-11e7-91aa-52da5c4d347d.png">

#### Show component source in editor

It's support Atom, Subline, VSCode for macOS.

<img width="276" alt="tt" src="https://cloud.githubusercontent.com/assets/3001525/25572822/a83fdafa-2e71-11e7-8093-cce3f7db98c0.png">

## Inspect elements

You can read the section [`Integration with React Native Inspector`](https://github.com/facebook/react-devtools/tree/master/packages/react-devtools#integration-with-react-native-inspector) from README of `react-devtools`, we have the same usage with the package.

## Change theme of Chrome DevTools with React DevTools together

You can change Chrome DevTools theme (Default / Dark), the theme of React DevTools will be changed together if you have no selected another theme for React DevTools:

![2017-08-23 13_20_17](https://user-images.githubusercontent.com/3001525/29600011-f0782798-8798-11e7-88cf-98f50e24199d.gif)

The `RNDebugger DevTools` option is by default to match Chrome DevTools.

**_NOTE_** Currently Chrome DevTools (Electron) doesn't reload automatically, we need to `Toggle Developer Tools` twice (Application menu or `⌥+⌘+I` (`Ctrl+Alt+I`)), subscribe [#87](https://github.com/jhen0409/react-native-debugger/issues/87) for tracking the issue.

## How to use it with real device?

- Starting from RN `0.53.0-rc`, it should work by default.
- If you're debugging via Wi-Fi, you need to edit `setupDevtools.js` of React Native manually, change `'localhost'` to your machine IP.
  - `>= 0.43` - The same as above, but use `host` property of `connectToDevTools` instead.

## Get `$r` global variable of React Native runtime in the console

Refer to [`Debugger Integration`](debugger-integration.md#debugging-tips).

## Other documentations

- [Getting Started](getting-started.md)
- [Debugger Integration](debugger-integration.md)
- [Redux DevTools Integration](redux-devtools-integration.md)
- [Shortcut references](shortcut-references.md)
- [Network inspect of Chrome Developer Tools](network-inspect-of-chrome-devtools.md)
- [Enable open in editor in console](enable-open-in-editor-in-console.md)
- [Config file in home directory](config-file-in-home-directory.md)
- [Troubleshooting](troubleshooting.md)
- [Contributing](contributing.md)
