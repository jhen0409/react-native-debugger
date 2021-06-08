# React DevTools Integration

**_NOTE_** Supported React Native version is `>= 0.62`. Please downgrade RNDebugger version to `0.10` if you're using older versions of React Native.

The [React DevTools](https://facebook.github.io/react-native/docs/debugging#react-developer-tools) is built by [`facebook/react/packages/react-devtools-core`](https://github.com/facebook/react/tree/master/packages/react-devtools-core).

It will open a WebSocket server to waiting React Native connection. The connection is already included in React Native (see [`setUpReactDevTools.js`](https://github.com/facebook/react-native/blob/0.62-stable/Libraries/Core/setUpReactDevTools.js)), it will keep trying to connect the React DevTools server in development mode, it should work well without any specification.

We made the server listen to a random port and inject `window.__REACT_DEVTOOLS_PORT__` global variable in debugger worker.

For Android, we have the built-in `adb` util and it will reverse the port automatically.

## Get `$r` global variable of React Native runtime in the console

Refer to [`Debugger Integration`](debugger-integration.md#debugging-tips).

## __*Question*__: I got `Unsupported` meesage from React DevTools

If you're using React Native version >= 0.62 and keep React Native Debugger as the latest version, here is what you can do:

In your app project, upgrade `react-devtools-core` dependency to match the React DevTools version:

- OPTION 1: Just `yarn upgrade react-native`, the `react-devtools-core` dependency should be updated to latest version.
- OPTION 2: Delete `react-devtools-core` block in `yarn.lock`, then re-install dependencies by `yarn`
- OPTION 3: Use [yarn resolutions](https://classic.yarnpkg.com/en/docs/selective-version-resolutions/), just add `"react-devtools-core": "~4.13.5"` (Depends on the display version of React DevTools) to resolutions of `package.json`.

Reference: [Unsupported DevTools backend version](https://gist.github.com/bvaughn/4bc90775530873fdf8e7ade4a039e579#react-native-debugger)

## Other documentations

- [Getting Started](getting-started.md)
- [Debugger Integration](debugger-integration.md)
- [Redux DevTools Integration](redux-devtools-integration.md)
- [Apollo Client DevTools Integration](apollo-client-devtools-integration.md)
- [Shortcut references](shortcut-references.md)
- [Network inspect of Chrome Developer Tools](network-inspect-of-chrome-devtools.md)
- [Enable open in editor in console](enable-open-in-editor-in-console.md)
- [Config file in home directory](config-file-in-home-directory.md)
- [Troubleshooting](troubleshooting.md)
- [Contributing](contributing.md)
