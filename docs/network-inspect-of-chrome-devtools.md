# Network inspect of Chrome Developer Tools

__*WARNING*__: You should read [the limitations](#limitations) if you want to use this feature.

You can enable this feature by [context menu or Touch Bar](shortcut-references.md), then you can inspect network requests that use `XMLHttpRequest` or `fetch` on `Network` tab of Chrome Developer Tools.

## How it works?

See [the comments of `react-native/Libraries/Core/InitializeCore.js#L43-L53`](https://github.com/facebook/react-native/blob/0.45-stable/Libraries/Core/InitializeCore.js#L43-L53), it used `XMLHttpRequest` from WebWorker of Chrome:

```js
global.XMLHttpRequest = global.originalXMLHttpRequest ?
  global.originalXMLHttpRequest :
  global.XMLHttpRequest;
global.FormData = global.originalFormData ?
  global.originalFormData :
  global.FormData;
```

So you can open `Network` tab in devtools to inspect requests of `fetch` and `XMLHttpRequest`.

Even you can do this on official remote debugger, but it have two different:

* RNDebugger is based on [Electron](https://github.com/electron/electron) so it haven't CORS problem
* We supported to set [`Forbidden header name`](https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name), so you can use header like `Origin` and `User-Agent`.

## Limitations

It have some limitations you need pay attention:

* [iOS] It will passed `NSExceptionDomains` check, if you forget to set domain name, the requests will break in production, so we should be clear about the difference.
* React Native `FormData` support `uri` property you can use file from `CameraRoll`, but `originalFormData` doesn't supported.
* It can't inspect request like `Image` load, so if your Image source have set session, the session can't apply to `fetch` and `XMLHttpRequest`.

Of course, if you want to inspect deeper network requests (Like request of `Image`), use tool like [Charles](https://www.charlesproxy.com) or [Stetho](https://facebook.github.io/stetho) will be better.

## Other documentations

* [Getting Started](getting-started.md)
* [Debugger Integration](debugger-integration.md)
* [React DevTools Integration](react-devtools-integration.md)
* [Redux DevTools Integration](redux-devtools-integration.md)
* [Shortcut references](shortcut-references.md)
* [Enable open in editor in console](enable-open-in-editor-in-console.md)
* [Troubleshooting](troubleshooting.md)
* [Contributing](contributing.md)
