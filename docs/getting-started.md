# Getting Started

Just these steps will let you start RNDebugger out of box:

- Install the latest version ([download page](https://github.com/jhen0409/react-native-debugger/releases)).
- Make sure all debugger clients of React Native are closed, usually are `http://localhost:<port>/debugger-ui`
- Make sure RNDebugger is open and wait state.
- RNDebugger will try connect to debugger proxy, use port `8081` by default, you can new debugger window (macOS: `Command+T`, Linux/Windows: `Ctrl+T`) to specify the port if you want.
- Enable `Debug JS Remotely` of [developer menu](https://facebook.github.io/react-native/docs/debugging.html#accessing-the-in-app-developer-menu) on your app

## Launch by CLI or React Native packager (`macOS` only)

### The `rndebugger:` URI scheme

Launch RNDebugger by typing the following command:

```bash
$ open "rndebugger://set-debugger-loc?host=localhost&port=8081"
```

The `host` / `port` means React Native packager. You may need to set `port` if you customize the packager port. (`8081` by default)

From [`Debugging using a custom JavaScript debugger`](https://facebook.github.io/react-native/docs/debugging.html#debugging-using-a-custom-javascript-debugger) of React Native docs, you can use `REACT_DEBUGGER` env on react-native packager, it will try to launch RNDebugger when you turn on `Debug JS Remotely`. For example, [Artsy's Emission](https://github.com/artsy/emission/blob/45417ca425f2cba7d2da21902ef8ff1cd093a024/package.json#L28) using the env for launch RNDebugger:

```bash
$ REACT_DEBUGGER="open -g 'rndebugger://set-debugger-loc?port=8001' ||" react-native start
```

Special case of Expo (CRNA):

```bash
$ REACT_DEBUGGER="unset ELECTRON_RUN_AS_NODE && open -g 'rndebugger://set-debugger-loc?port=19001' ||" npm start
```

**_NOTE_** Currently the `REACT_DEBUGGER` env doesn't work with Haul bundler, please track [issue #141](https://github.com/jhen0409/react-native-debugger/issues/141) for more information.

### Use [`react-native-debugger-open`](../npm-package)

If you don‘t need to add a dependency, you can use the package, it can help with:

- Replace `open debugger-ui with Chrome` to `open React Native Debugger` in react-native packager, saving you from closing the debugger-ui page everytime it automatically opens :)
- Detect react-native packager port then send to the app, if you launch packager with custom `--port` or use Expo, this will be very useful

### What about Linux / Windows support?

Currently the `rndebugger:` URI scheme doesn't support for Linux / Windows.

In [`react-native-debugger-open`](../npm-package), it can be sent the `host` / `port` setting if RNDebugger opened, but can't automatically open if closed.

If you want to have the feature (`rndebugger:` or another way), you are welcome to contribute. Please read [contributing](https://github.com/jhen0409/react-native-debugger/blob/master/docs/contributing.md) to become a maintainer.

## Use Redux DevTools Extension API

Using the same API as [`redux-devtools-extension`](https://github.com/zalmoxisus/redux-devtools-extension#1-with-redux) is very simple:

```js
const store = createStore(
  reducer /* preloadedState, */,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
)
```

See [`Redux DevTools Integration`](redux-devtools-integration.md) section for more information.

## Platform support

- [React Native](https://github.com/facebook/react-native) >= 0.43
- [React Native for macOS](https://github.com/ptmt/react-native-macos) (formerly react-native-desktop) >= 0.14.0
- [React Native for Windows](https://github.com/Microsoft/react-native-windows)

## Examples for use RNDebugger

- [`Redux counter`](../examples/counter-with-redux)
- [`MobX counter`](../examples/counter-with-mobx) - with [`mobx-remotedev`](https://github.com/zalmoxisus/mobx-remotedev).

The examples were bootstrapped with [`create-react-native-app`](https://github.com/react-community/create-react-native-app).

## Auto-update RNDebugger app (Supported v0.5.0 after)

Currently auto-update is only supported for macOS. Linux and Windows will show a dialog of new versions available for download.

You can also click `React Native Debugger` (`RND` for Linux / Windows) -> `Check for Updates...` in the application menu.

## Other documentations

- [Debugger Integration](debugger-integration.md)
- [React DevTools Integration](react-devtools-integration.md)
- [Redux DevTools Integration](redux-devtools-integration.md)
- [Apollo Client DevTools Integration](apollo-client-devtools-integration.md)
- [Shortcut references](shortcut-references.md)
- [Network inspect of Chrome Developer Tools](network-inspect-of-chrome-devtools.md)
- [Enable open in editor in console](enable-open-in-editor-in-console.md)
- [Config file in home directory](config-file-in-home-directory.md)
- [Troubleshooting](troubleshooting.md)
- [Contributing](contributing.md)
