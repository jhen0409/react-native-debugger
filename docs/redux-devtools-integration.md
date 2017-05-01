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
  - `mobx` with [`mobx-remotedev`](https://github.com/zalmoxisus/mobx-remotedev) can be used here, see [`the counter example`](../examples/counter-with-mobx)
* [Troubleshooting](http://extension.remotedev.io/docs/Troubleshooting.html)
