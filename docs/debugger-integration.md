# Debugger integration

The Debugger worker is referenced from [react-native](https://github.com/facebook/react-native/blob/master/local-cli/server/util/) debugger-ui, so it's only working if you're enabled `Debug JS Remotely`, you can debug your app in Chrome Developer Tools, we keep the following tabs:

* `Console`
* `Sources`
* `Network` (Inspect Network requests if you are enabled [Network Inspect](network-inspect-of-chrome-devtools))
* `Memory`

## Multiple React Native packager (custom port) support

We can use [`react-native-debugger-open`](../npm-package) package to detect RN packager port, it will open an another window automatically if another debugger workers are running.

If you don't use [the npm package](../npm-package) and want to change port, click `Debugger` -> `New Window` (`Command⌘ + T` for macOS, `Ctrl + T` for Linux / Windows) in application menu, you need to type an another RN packager port. The default port is use [`Expo`](https://github.com/expo/expo) (and [`create-react-native-app`](https://github.com/react-community/create-react-native-app)) default port.

For macOS (10.12+), it used native tabs feature, see [the support page](https://support.apple.com/en-us/HT206998) for known how to use and setting.

## Debugging tips

#### Get global variables of React Native runtime in the console

You need to switch worker thread for console, open `Console` tab on Chrome DevTools, and make sure you are in `RNDebuggerWorker.js` context:

![2016-11-05 6 56 45](https://cloud.githubusercontent.com/assets/3001525/20025024/7edce770-a325-11e6-9e77-618c7ba04123.png)

#### Use `require('<providesModule>')` in the console

In the console, you can use `require` for module of specified [`@providesModule`](https://github.com/facebook/react-native/search?l=JavaScript&q=providesModule&type=&utf8=✓) words in React Native, this is example for use `AsyncStorage`:

<img width="519" alt="t" src="https://cloud.githubusercontent.com/assets/3001525/25587896/a1253c9e-2ed8-11e7-9d70-6368cfd5e016.png">

Make sure you are in `RNDebuggerWorker.js` context, the same as the previous tip.

#### [iOS only] Force your app on debug mode

For enable `Debug Remotely` in real device, you may fatigued to shake device to show developer menu, you can use the built-in `DevSettings` native module on iOS:

```js
import { NativeModules } from 'react-native'

if (__DEV__) {
  NativeModules.DevSettings.setIsDebuggingRemotely(true)
}

// For RN < 0.43
if (__DEV__) {
  NativeModules.DevMenu.debugRemotely(true)
}
```

## Other documentations

* [Getting Started](getting-started.md)
* [React DevTools Integration](react-devtools-integration.md)
* [Redux DevTools Integration](redux-devtools-integration.md)
* [Shortcut references](shortcut-references.md)
* [Network inspect of Chrome Developer Tools](network-inspect-of-chrome-devtools.md)
* [Enable open in editor in console](enable-open-in-editor-in-console.md)
* [Troubleshooting](troubleshooting.md)
* [Contributing](contributing.md)
