// json5
module.exports = `{
  // Font family of the debugger window
  // fontFamily: 'monaco, Consolas, Lucida Console, monospace',

  // Zoom level of the debugger window, it will override persited zoomLevel
  // zoomLevel: 0,

  // Settings of debugger window, 
  windowBounds: {
    // Size of the debugger window, it will override persisted size
    // width: 1024,
    // height: 750,

    // Show frame for debugger window
    // but due to https://github.com/electron/electron/issues/3647
    // so we can't have custom title bar if no frame
    // titleBarStyle: 'hidden',
    frame: true,
  },

  // Auto check update on RNDebugger startup
  autoUpdate: true,

  // RNDebugger will open debugger window with the ports when app launched
  defaultRNPackagerPorts: [8081],

  // Env for
  // open React DevTools source file link
  // and enable open in editor for console log for RNDebugger
  editor: '',

  // Set default react-devtools theme (default is match Chrome DevTools theme)
  // but the default theme doesn't change manually changed theme
  // see https://github.com/facebook/react-devtools/blob/master/frontend/Themes/Themes.js to get more
  defaultReactDevToolsTheme: 'RNDebugger',

  // Set default react-devtools port (default is \`19567+\` if it is not being used).
  // The devtools backend of React Native will use the port to connect to the devtools server.
  // You should use that if you have some rules for binding port.
  //   (like https://github.com/jhen0409/react-native-debugger/issues/397)
  defaultReactDevToolsPort: 19567,

  // Enable Network Inspect by default
  // See https://github.com/jhen0409/react-native-debugger/blob/master/docs/network-inspect-of-chrome-devtools.md
  defaultNetworkInspect: false,

  // Refresh devtools when doing JS reload every N times. (-1 for disabled)
  // This can effectively avoid possible memory leaks (Like
  // https://github.com/jhen0409/react-native-debugger/issues/405) in devtools.
  timesJSLoadToRefreshDevTools: -1,
}
`;
