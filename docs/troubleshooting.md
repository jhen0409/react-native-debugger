# Troubleshooting

## Debugger causes app to load stale JS bundle ([#423](https://github.com/jhen0409/react-native-debugger/issues/423))

This issue was fixed by [v0.10.9](https://github.com/jhen0409/react-native-debugger/releases/tag/v0.10.9) and [v0.11.1](https://github.com/jhen0409/react-native-debugger/releases/tag/v0.11.1). If you are still using the old version for some reason, you can turn off Network cache manually on devtools:

![image](https://user-images.githubusercontent.com/848589/69504219-b0d46d00-0f85-11ea-99ed-de5e4e2e59c0.png)

## Some shortcuts (e.g. `Reload` / `Clear AsyncStorage`) are missing on the Debugger

- For Android and React Native version less than v0.60, you need to add and link [`react-native-devsettings-android`](https://github.com/jhen0409/react-native-devsettings-android) package
- If you're not using dev bundle (dev=true) from React Native packager, it will not working as expected.
- For some reasons, some dependencies may affected [Promise](https://github.com/jhen0409/react-native-debugger/blob/master/app/worker/utils.js#L7) behavior. It is recommended to use the initial project to find out the reason.
- If you are sure it is caused by a new version of React Native, please file an new issue.

## How to resolve problem of high memory usage on devtools?

You may have got a problem when you often reload JS, devtools process takes your RAM even more than 1G, it does not seem to clean.

In case of using [official remote debugger](https://facebook.github.io/react-native/docs/debugging.html#chrome-developer-tools), tested a initial project with remote debugging mode on Chrome 62 (beta), continuous reload JS 30 times:

Before:  
<img width="600" alt="2017-09-19 5 32 05 pm" src="https://user-images.githubusercontent.com/3001525/30585922-ed1e557a-9cf3-11e7-9730-3b941618924f.png">

After:  
<img width="600" alt="2017-09-19 5 31 33 pm" src="https://user-images.githubusercontent.com/3001525/30585923-ed1e3a54-9cf3-11e7-8d09-9915f8cffea6.png">

Fortunately, the current versions of RNDebugger (Chromium 58) is better than Chrome (maybe >= 59?), but it still has a amount of growth:

Before:  
<img width="704" alt="2017-09-19 5 40 18 pm" src="https://user-images.githubusercontent.com/3001525/30586300-27e0df7e-9cf5-11e7-9614-07162e86680c.png">

After:  
<img width="704" alt="2017-09-19 5 41 27 pm" src="https://user-images.githubusercontent.com/3001525/30586302-29e0b268-9cf5-11e7-9206-e222bd753aa1.png">

To avoid similar problems in the future, there is a way to restart the Chrome devtools (macOS: `CMD+OPTION+I`, Linux/Windows: `CTRL+ALT+I`), the same applies to official remote debugger on Chrome. You can also consider to use [`timesJSLoadToRefreshDevTools` option in Config file in home directory](config-file-in-home-directory.md).

## [iOS] Debugger can't load bundle when I use real device

If you're getting the following error:

![](https://user-images.githubusercontent.com/3001525/28763926-214df82c-75f4-11e7-98bc-1be54638f91b.png)

It may caused by [`xip.io`](http://xip.io) service (RN use it for debug on real device), it lead your machine IP doesn't resolved sometimes. It's [enabled by default](https://github.com/facebook/react-native/blob/ca9202f2385354b7a6b4d818ceb46bd96a037a7b/scripts/react-native-xcode.sh#L94), you can disable it in RN custom script on Xcode if you sure you don't need the service:

<img width="839" alt="2017-07-31 1 19 34" src="https://user-images.githubusercontent.com/3001525/28763831-82811012-75f3-11e7-9675-d5ae515f4f38.png">

## React Inspector get stuck at "Connecting to React…" for RN ^0.43 ([#45](https://github.com/jhen0409/react-native-debugger/issues/45))

It usually on Android, the problem is related to `requestIdleCallback` API (try to check if it not work on debug mode).

This issue have been fixed in `react-devtools-core@^2.3.0`, please ensure the version is correct in your React Native project (Note that it's dependency of `react-native`).

Also, sometimes it have timer problem between host machine and device (emulator), you need make sure `date & time` setting is correct:

<img width="300" alt="2017-07-18 10 09 01" src="https://user-images.githubusercontent.com/3001525/28492059-3c6957ea-6f2e-11e7-8901-8f4431f67a71.png">

Or try to restart your device (emulator).

## [Windows 10] React native debugger process starts but no visible window ([#459](https://github.com/jhen0409/react-native-debugger/issues/459))  

This issue is caused by Windows 10 dark mode, for a workaround please disable dark mode and enable it again after launching react-native-debugger

## Other documentations

- [Getting Started](getting-started.md)
- [Debugger Integration](debugger-integration.md)
- [React DevTools Integration](react-devtools-integration.md)
- [Redux DevTools Integration](redux-devtools-integration.md)
- [Apollo Client DevTools Integration](apollo-client-devtools-integration.md)
- [Shortcut references](shortcut-references.md)
- [Network inspect of Chrome Developer Tools](network-inspect-of-chrome-devtools.md)
- [Enable open in editor in console](enable-open-in-editor-in-console.md)
- [Config file in home directory](config-file-in-home-directory.md)
- [Contributing](contributing.md)
