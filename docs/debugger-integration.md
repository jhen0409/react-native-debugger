# Debugger integration

The Debugger part is referenced from [react-native](https://github.com/facebook/react-native/blob/master/local-cli/server/util/) debugger-ui.

## Developer menu integration (macOS)

RNDebugger have developer menu of React Native integration:

<img width="1085" alt="touch-bar" src="https://cloud.githubusercontent.com/assets/3001525/25571883/38d4da3a-2e67-11e7-9386-f52bb62572b3.png">

Just includes two developer menu features (iOS only):

* Reload JS
* Inspector (Toogle Elements Inspector) (RN ^0.43 support)

These would be useful for real device, instead of open developer menu in iOS device manually.

* Network Inspect (Enable / Disable [this tip](#inpsect-network-requests-by-network-tab-of-chrome-devtools-see-also-15))
* Redux Slider (If you're using [`Redux API`](redux-devtools-integration.md))

If your Mac haven't TouchBar support, you can use [`touch-bar-simulator`](https://github.com/sindresorhus/touch-bar-simulator), the features are still very useful.

## Debugging tips

#### Get global variables of React Native runtime in the console

You need to switch worker thread for console, open `Console` tab on Chrome DevTools, tap `top` context and change to `RNDebuggerWorker.js` context:

![2016-11-05 6 56 45](https://cloud.githubusercontent.com/assets/3001525/20025024/7edce770-a325-11e6-9e77-618c7ba04123.png)

#### Inpsect network requests by `Network` tab of Chrome DevTools (See also [#15](https://github.com/jhen0409/react-native-debugger/issues/15))

We can do:

```js
// const bakXHR = global.XMLHttpRequest;
// const bakFormData = global.FormData;
global.XMLHttpRequest = global.originalXMLHttpRequest ?
  global.originalXMLHttpRequest :
  global.XMLHttpRequest;
global.FormData = global.originalFormData ?
  global.originalFormData :
  global.FormData;
```

Just requires attention:

* It will break `NSExceptionDomains` for iOS, because `originalXMLHttpRequest` is from debugger worker (it will replace native request), so we should be clear about the difference in debug mode.
* It can't inspect request like `Image` load, so if your Image source have set session, the session can't apply to `fetch` or `XHR`.

If you want to inspect deeper network requests (Like request of `Image`), use tool like [Stetho](https://facebook.github.io/stetho) will be better.
