# Troubleshooting

## React Inspector get stuck at "Connecting to React…" for RN ^0.43 ([#45](https://github.com/jhen0409/react-native-debugger/issues/45))

It usually on Android, maybe the problem is related to `requestIdleCallback` API (try to check if it not work on debug mode), make sure the device time is the same as the host (your computer), otherwise you can add the following code to [setupDevtools.js#L17](https://github.com/facebook/react-native/blob/dba133a29194e300e9a2e9e6753f9d4e3a13c194/Libraries/Core/Devtools/setupDevtools.js#L17):

```js
// ......
if (__DEV__) {
  // ......
  const bakRIC = window.requestIdleCallback;
  const bakCIC = window.cancelIdleCallback;
  // To ensure react-devtools-core use polyfill instead of requestIdleCallback
  window.requestIdleCallback = null;
  window.cancelIdleCallback = null;
  const {connectToDevTools} = require('react-devtools-core'); // Line 17
  window.requestIdleCallback = bakRIC;
  window.cancelIdleCallback = bakCIC;
  // ......
}
```

[facebook/react-native#13116](https://github.com/facebook/react-native/pull/13116) can solved this issue, you can just waiting for the PR merged or use the patch.
