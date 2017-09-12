# Redux DevTools Integration

We used [RemoteDev App](https://github.com/zalmoxisus/remotedev-app) and made the API same with [Redux DevTools Extension](https://github.com/zalmoxisus/redux-devtools-extension).

If you're enabled `Debug JS remotely` with React Native Debugger, the following API is already included in global:

* `window.__REDUX_DEVTOOLS_EXTENSION__`
* `window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__`
* `window.__REDUX_DEVTOOLS_EXTENSION__.connect`
* You can just use [`redux-devtools-extension`](https://www.npmjs.com/package/redux-devtools-extension) npm package.

See also:

* [API Reference](http://extension.remotedev.io/docs/API/)
* [Integrations](http://extension.remotedev.io/docs/Integrations.html)
  - [MobX](https://github.com/mobxjs/mobx)
    - [`mobx-remotedev`](https://github.com/zalmoxisus/mobx-remotedev) (see [`the counter example`](../examples/counter-with-mobx))
    - [`mobx-state-tree`](https://github.com/mobxjs/mobx-state-tree)
* [Troubleshooting](http://extension.remotedev.io/docs/Troubleshooting.html) (you can ignore the browser extension specified problems)

## Other documentations

* [Getting Started](getting-started.md)
* [Debugger Integration](debugger-integration.md)
* [React DevTools Integration](react-devtools-integration.md)
* [Troubleshooting](troubleshooting.md)
* [Contributing](contributing.md)
