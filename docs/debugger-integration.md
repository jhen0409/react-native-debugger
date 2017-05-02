# Debugger integration

The Debugger part is referenced from [react-native](https://github.com/facebook/react-native/blob/master/local-cli/server/util/) debugger-ui.

## Developer menu integration (macOS)

RNDebugger have [developer menu](https://facebook.github.io/react-native/docs/debugging.html#accessing-the-in-app-developer-menu) of React Native integration:

<img width="1085" alt="touch-bar" src="https://cloud.githubusercontent.com/assets/3001525/25571883/38d4da3a-2e67-11e7-9386-f52bb62572b3.png">

Just includes two developer menu features for iOS, these would be useful for real device, instead of open developer menu in iOS device manually:

* Reload JS
* Inspector (Toogle Elements Inspector) (RN ^0.43 support)

Other features:

* Network Inspect (Enable / Disable [this tip](#inpsect-network-requests-by-network-tab-of-chrome-devtools-see-also-15))
* Redux Slider (If you're using [`Redux API`](redux-devtools-integration.md))

If your Mac haven't TouchBar support, you can use [`touch-bar-simulator`](https://github.com/sindresorhus/touch-bar-simulator), the features are still very useful.

## Debugging tips

#### Get global variables of React Native runtime in the console

You need to switch worker thread for console, open `Console` tab on Chrome DevTools, tap `top` context and change to `RNDebuggerWorker.js` context:

![2016-11-05 6 56 45](https://cloud.githubusercontent.com/assets/3001525/20025024/7edce770-a325-11e6-9e77-618c7ba04123.png)

#### Use `require('<providesModule>')` in the console

In the console, you can use `require` for module of specified [`@providesModule`](https://github.com/facebook/react-native/search?l=JavaScript&q=providesModule&type=&utf8=✓) words in React Native, this is example for use `AsyncStorage`:

<img width="519" alt="t" src="https://cloud.githubusercontent.com/assets/3001525/25587896/a1253c9e-2ed8-11e7-9d70-6368cfd5e016.png">

Make sure you're changed to `RNDebuggerWorker.js` context, the same as the previous tip.

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

Warning:

* It will break `NSExceptionDomains` for iOS, because `originalXMLHttpRequest` is from debugger worker (it will replace native request), so we should be clear about the difference in debug mode.
* It can't inspect request like `Image` load, so if your Image source have set session, the session can't apply to `fetch` and `XMLHttpRequest`.

Also, if you want to inspect deeper network requests (Like request of `Image`), use tool like [Stetho](https://facebook.github.io/stetho) will be better.
