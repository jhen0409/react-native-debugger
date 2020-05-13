# React DevTools Integration

**_NOTE_** Supported React Native version is `>= 0.62`. Please downgrade RNDebugger version to `0.10` if you're using older versions of React Native.

The [React DevTools](https://facebook.github.io/react-native/docs/debugging#react-developer-tools) is built by [`facebook/react/packages/react-devtools-core`](https://github.com/facebook/react/tree/master/packages/react-devtools-core).

It will open a WebSocket server to waiting React Native connection. The connection already included in React Native (see [`setUpReactDevTools.js`](https://github.com/facebook/react-native/blob/0.62-stable/Libraries/Core/setUpReactDevTools.js)), it will keep trying to connect the React DevTools server in development mode, it should works well without specify anything.

We made the server listen a random port and inject `window.__REACT_DEVTOOLS_PORT__` global variable in debugger worker.

For Android, we have the built-in `adb` util and it will reverse the port automatically.

## Get `$r` global variable of React Native runtime in the console

Refer to [`Debugger Integration`](debugger-integration.md#debugging-tips).

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
