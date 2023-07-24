# Redux DevTools Integration

We used [@redux-devtools/app](https://github.com/reduxjs/redux-devtools/tree/main/packages/redux-devtools-app) and made the API same with [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools/tree/main/extension).

If you've enabled `Debug JS remotely` with React Native Debugger, the following API is already included in global:

- `window.__REDUX_DEVTOOLS_EXTENSION__`
- `window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__`
- `window.__REDUX_DEVTOOLS_EXTENSION__.connect`
- You can just use [`redux-devtools-extension`](https://www.npmjs.com/package/redux-devtools-extension) npm package.

See also:

- [Redux DevTools main repository]](https://github.com/reduxjs/redux-devtools/blob/main/README.md)
- [API Reference](https://github.com/reduxjs/redux-devtools/tree/main/extension/docs/API)
- [Troubleshooting](https://github.com/reduxjs/redux-devtools/blob/main/extension/docs/Troubleshooting.md)
- Other Integrations
  - [`mobx-state-tree`](https://github.com/mobxjs/mobx-state-tree) - Use [`connectReduxDevtools`](https://github.com/mobxjs/mobx-state-tree/tree/3fc79b0b3ce7ad3e26d6bd5745fd9412d35c431c/packages/mst-middlewares#connectreduxdevtools) middleware.

You can ignore the things specified by the browser extension.

## About `trace` feature

- The debugger app might be slowed down if you enabled the `trace` feature and visited the `Trace` tab, because it will load and parse the source map for every selected action.

## Other documentations

- [Getting Started](getting-started.md)
- [Debugger Integration](debugger-integration.md)
- [React DevTools Integration](react-devtools-integration.md)
- [Apollo Client DevTools Integration](apollo-client-devtools-integration.md)
- [Shortcut references](shortcut-references.md)
- [Network inspect of Chrome Developer Tools](network-inspect-of-chrome-devtools.md)
- [Enable open in editor in console](enable-open-in-editor-in-console.md)
- [Config file in home directory](config-file-in-home-directory.md)
- [Troubleshooting](troubleshooting.md)
- [Contributing](contributing.md)
