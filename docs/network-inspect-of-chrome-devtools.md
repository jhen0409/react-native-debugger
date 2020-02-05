# Network Inspect of Chrome Developer Tools

**_WARNING_**: You should read [the limitations](#limitations) if you want to use this feature.

When you have Network Inspect enabled you can inspect network requests that use `XMLHttpRequest` or `fetch` on the `Network` tab of Chrome Developer Tools.

You can enable this feature by one of these ways:
 
 - [context menu or Touch Bar](shortcut-references.md) (Network Inspect will be enabled while the RNDebugger is running, after closing it will reset to the default value);
 - by the `defaultNetworkInspect` option in the [config file](config-file-in-home-directory.md) (Network Inspect will be enabled permanently).


## How it works

See [the comments of `react-native/Libraries/Utilities/PolyfillFunctions#L15-L27`](https://github.com/facebook/react-native/blob/ab97b9f6021d2b31b7155970c2be0c83f7e43f04/Libraries/Utilities/PolyfillFunctions.js#L15-L27). It uses `XMLHttpRequest` from WebWorker in Chrome, basically it can manually setup by:

```js
global.XMLHttpRequest = global.originalXMLHttpRequest
  ? global.originalXMLHttpRequest
  : global.XMLHttpRequest
global.FormData = global.originalFormData
  ? global.originalFormData
  : global.FormData

fetch // Ensure to get the lazy property

if (window.__FETCH_SUPPORT__) {
  // it's RNDebugger only to have
  window.__FETCH_SUPPORT__.blob = false
} else {
  /*
   * Set __FETCH_SUPPORT__ to false is just work for `fetch`.
   * If you're using another way you can just use the native Blob and remove the `else` statement
   */
  global.Blob = global.originalBlob ? global.originalBlob : global.Blob
  global.FileReader = global.originalFileReader
    ? global.originalFileReader
    : global.FileReader
}
```

> Note that replace `global.Blob` will cause issue like [#56](https://github.com/jhen0409/react-native-debugger/issues/56).

This allows you can open the `Network` tab in devtools to inspect requests of `fetch` and `XMLHttpRequest`.

You can also do this on the official remote debugger, but it has two differences:

- RNDebugger is based on [Electron](https://github.com/electron/electron) so it doesn't have the CORS issue
- We support setting [`Forbidden header names`](https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name), so you can use headers like `Origin` and `User-Agent`.

## Limitations

There are some limitations of debugging network requests using Network Inspect:

- [iOS] Requests pass `NSExceptionDomains` checks. If you forget to set a domain name, the requests will break in production. You should be clear about the difference.
- React Native `FormData` supports the `uri` property. You can use files from `CameraRoll`, but `originalFormData` isn't supported.
- It can't inspect request like `Image`s loaded from urls for `src`, so if your `Image` source has a set session, the session can't apply to `fetch` and `XMLHttpRequest`.

If you want to inspect deeper network requests (like requests made with `Image`), use tools like [Charles](https://www.charlesproxy.com) or [Stetho](https://facebook.github.io/stetho).

## Other documentations

- [Getting Started](getting-started.md)
- [Debugger Integration](debugger-integration.md)
- [React DevTools Integration](react-devtools-integration.md)
- [Redux DevTools Integration](redux-devtools-integration.md)
- [Apollo Client DevTools Integration](apollo-client-devtools-integration.md)
- [Shortcut references](shortcut-references.md)
- [Enable open in editor in console](enable-open-in-editor-in-console.md)
- [Config file in home directory](config-file-in-home-directory.md)
- [Troubleshooting](troubleshooting.md)
- [Contributing](contributing.md)
