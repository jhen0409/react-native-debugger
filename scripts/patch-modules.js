const shell = require('shelljs');
const path = require('path');

console.log('Patch react-devtools-core');

// backend vender is backward compatibility for RN <= 0.42
// the problem related to https://github.com/facebook/react-devtools/pull/749
// fixed in core v2.3 but have no patch in the backend vender
const rdBackend = path.join(
  __dirname,
  '../dist/node_modules/react-devtools-core/vendor/backend-1.0.6.js'
);
shell.sed(
  '-i',
  'window.requestIdleCallback',
  'window.__REQUEST_IDLE_CALLBACK_REPLACED_BY_PATCH__',
  rdBackend
);
shell.sed(
  '-i',
  'window.cancelIdleCallback',
  'window.__CANCEL_IDLE_CALLBACK_REPLACED_BY_PATCH__',
  rdBackend
);

const rdStandalone = path.join(
  __dirname,
  '../dist/node_modules/react-devtools-core/build/standalone.js'
);
// Hide source map of react-devtools-core
// for optimize chrome devtools
shell.sed(
  '-i',
  '//# sourceMappingURL=standalone.js.map',
  '',
  rdStandalone
);
// Avoid logging from react-devtools-core
// log: connected, disconnected
// error: listening error (can be seen directly in the panel)
shell.sed(
  '-i',
  // eslint-disable-next-line
  /\(_console[0-9]* = console\).(log|warn|error).apply\(_console[0-9]*, \[ "\[React DevTools\]" \].concat\(args\)\)/,
  '',
  rdStandalone
);

console.log('Patch react-dev-utils/launchEditor');

shell.sed(
  '-i',
  /require\('chalk'\)/g,
  '{red:f=>f,cyan:f=>f,green:f=>f}',
  path.join(__dirname, '../node_modules/react-dev-utils/launchEditor.js')
);
