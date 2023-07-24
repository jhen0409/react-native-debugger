# Shortcut references

This section will explain about the following items in RNDebugger.

- [Content menu](#context-menu)
- [Touch Bar](#touch-bar-in-macos)
- [Keyboard shortcuts](#keyboard-shortcuts)

## Context menu

We have context menu (right-click) for provides useful features:

![Context menu](https://cloud.githubusercontent.com/assets/3001525/25920996/5c488966-3606-11e7-8d0c-cb564671067b.gif)

- Reload
- Toggle Elements Inspector
- Show Developer Menu [iOS only]
- Enable / Disable [Network Inspect](debugger-integration.md#how-network-inspect-works)
- Log AsyncStorage content
- Clear AsyncStorage

It includes the developer menu features, these would be useful for real device, instead of open developer menu in device manually.

## Keyboard shortcuts

- Reload JS (macOS: `Command+R`, Windows / Linux: `Ctrl+R`)
- Toggle Elements Inspector (macOS: `Command+I`, Windows / Linux: `Ctrl+I`)
- New Debugger Window (macOS: `Command+T`, Windows / Linux: `Ctrl+T`)
- Toggle Developer Tools (macOS: `Command+Option+I`, Windows / Linux: `Ctrl+Alt+I`)
- Toggle Redux DevTools (macOS: `Command+Option+J`, Windows / Linux: `Ctrl+Alt+J`)
- Toggle React DevTools (macOS: `Command+Option+K`, Windows / Linux: `Ctrl+Alt+K`)
- Quickly into search field of React DevTools (Type `/`)

You can also read [Keyboard Shortcuts Reference of Chrome Developer Tools](https://developers.google.com/web/tools/chrome-devtools/shortcuts).

## Touch Bar in macOS

<img alt="touch-bar" src="https://user-images.githubusercontent.com/3001525/27730359-8565810a-5dbb-11e7-9052-9fd4feb72181.png">

The `Redux Slider` will shown on right if you're using [`Redux API`](redux-devtools-integration.md),

If your Mac haven't TouchBar support and you still want to use the feature, you can use [Touché](https://redsweater.com/touche/).

## Other documentations

- [Getting Started](getting-started.md)
- [Debugger Integration](debugger-integration.md)
- [React DevTools Integration](react-devtools-integration.md)
- [Redux DevTools Integration](redux-devtools-integration.md)
- [Apollo Client DevTools Integration](apollo-client-devtools-integration.md)
- [Network inspect of Chrome Developer Tools](network-inspect-of-chrome-devtools.md)
- [Enable open in editor in console](enable-open-in-editor-in-console.md)
- [Config file in home directory](config-file-in-home-directory.md)
- [Troubleshooting](troubleshooting.md)
- [Contributing](contributing.md)
