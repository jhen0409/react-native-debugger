const shell = require('shelljs');
const path = require('path');

console.log('Patch react-devtools-core');
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

console.log('Patch react-dev-utils/launchEditor');
shell.sed(
  '-i',
  /require\('chalk'\)/g,
  '{red:f=>f,cyan:f=>f,green:f=>f}',
  path.join(__dirname, '../node_modules/react-dev-utils/launchEditor.js')
);
