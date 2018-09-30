const shell = require('shelljs');
const path = require('path');

console.log('Patch react-devtools-core');

const rdStandalone = path.join(
  __dirname,
  '../dist/node_modules/react-devtools-core/build/standalone.js'
);
// Hide source map of react-devtools-core
// for optimize chrome devtools
shell.sed('-i', '//# sourceMappingURL=standalone.js.map', '', rdStandalone);
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
