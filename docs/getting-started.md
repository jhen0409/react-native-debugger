# Getting Started

Just these steps let you start RNDebugger out of box:

* All `http://localhost:<port>/debugger-ui` pages are closed
* Make sure RNDebugger is open and wait state, or you can use [react-native-debugger-open](../npm-package) npm package instead, it can:
  * Replace `open debugger-ui with Chrome` to `open React Native Debugger` from react-native packager, saving you from closing the debugger-ui page everytime it automatically opens :)
  * Detect react-native packager port then send to the app, if you launch packager with custom `--port`, this will very useful
* Enable `Debug JS Remotely` mode on your app

## Platform support

* [React Native](https://github.com/facebook/react-native) >= 0.21.0
* [React Native for macOS](https://github.com/ptmt/react-native-desktop) (formerly react-native-desktop) >= 0.8.7
* [React Native for Windows](https://github.com/ReactWindows/react-native-windows/blob/master/Libraries/Devtools/setupDevtools.windows.js) (need to remove [setupDevtools.windows.js](https://github.com/ReactWindows/react-native-windows/blob/master/Libraries/Devtools/setupDevtools.windows.js))

## Examples

* [`Redux counter`](../examples/counter-with-redux)
* [`MobX counter`](../examples/counter-with-mobx) - with [`mobx-remotedev`](https://github.com/zalmoxisus/mobx-remotedev).
