# Troubleshooting

## React Inspector get stuck at "Connecting to React…" for RN ^0.43 ([#45](https://github.com/jhen0409/react-native-debugger/issues/45))

It usually on Android, the problem is related to `requestIdleCallback` API (try to check if it not work on debug mode).

This issue have been fixed in `react-devtools-core@^2.3.0`, please ensure the version is correct in your React Native project (Note that it's dependency of `react-native`).

Also, sometimes it have timer problem between host machine and device (emulator), you need make sure `date & time` setting is correct:

<img width="300" alt="2017-07-18 10 09 01" src="https://user-images.githubusercontent.com/3001525/28492059-3c6957ea-6f2e-11e7-8901-8f4431f67a71.png">

Or try to restart your device (emulator).

## Console thrown a lot of errors when I use React Inspector on Android

If you're experiencing the issue like [this comment of #84](https://github.com/jhen0409/react-native-debugger/issues/84#issuecomment-304611817), this issue have been fixed in `react-devtools-core@^2.3.0`, please ensure the version is correct in your React Native project (Note that it's dependency of `react-native`).
