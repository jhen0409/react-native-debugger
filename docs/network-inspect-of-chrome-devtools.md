# Network Inspect of Chrome Developer Tools

__*WARNING*__: You should read [the limitations](#limitations) if you want to use this feature.

You can enable this feature by the [context menu or Touch Bar](shortcut-references.md), then you can inspect network requests that use `XMLHttpRequest` or `fetch` on the `Network` tab of Chrome Developer Tools.

## How it works

See [the comments of `react-native/Libraries/Core/InitializeCore.js#L43-L53`](https://github.com/facebook/react-native/blob/0.45-stable/Libraries/Core/InitializeCore.js#L43-L53). It uses `XMLHttpRequest` from WebWorker in Chrome:

```js
global.XMLHttpRequest = global.originalXMLHttpRequest ?
  global.originalXMLHttpRequest :
  global.XMLHttpRequest;
global.FormData = global.originalFormData ?
  global.originalFormData :
  global.FormData;
```

This allows you can open the `Network` tab in devtools to inspect requests of `fetch` and `XMLHttpRequest`.

You can also do this on the official remote debugger, but it has two differences:

* RNDebugger is based on [Electron](https://github.com/electron/electron) so it doesn't have the CORS issue
* We support setting [`Forbidden header names`](https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name), so you can use headers like `Origin` and `User-Agent`.

## Limitations

There are some limitations of debugging network requests using Network Inspect:

* [iOS] Requests pass `NSExceptionDomains` checks. If you forget to set a domain name, the requests will break in production. You should be clear about the difference.
* React Native `FormData` supports the `uri` property. You can use files from `CameraRoll`, but `originalFormData` isn't supported.
* It can't inspect request like `Image`s loaded from urls for `src`, so if your `Image` source has a set session, the session can't apply to `fetch` and `XMLHttpRequest`.

If you want to inspect deeper network requests (like requests made with `Image`), use tools like [Charles](https://www.charlesproxy.com) or [Stetho](https://facebook.github.io/stetho).

## Other documentations

* [Getting Started](getting-started.md)
* [Debugger Integration](debugger-integration.md)
* [React DevTools Integration](react-devtools-integration.md)
* [Redux DevTools Integration](redux-devtools-integration.md)
* [Shortcut references](shortcut-references.md)
* [Enable open in editor in console](enable-open-in-editor-in-console.md)
* [Troubleshooting](troubleshooting.md)
* [Contributing](contributing.md)
