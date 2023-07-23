const shell = require('shelljs');
const path = require('path');

console.log('Patch react-devtools-core');

const rdStandalone = path.join(
  __dirname,
  '../dist/node_modules/react-devtools-core/dist/standalone.js'
);

// Make react-devtools-core to auto detect theme
// We still use this patch because patch-package to patch js bundle is not very ideal
shell.sed(
  '-i',
  // eslint-disable-next-line
  /bridge:e,browserTheme:t="light"/,
  'bridge:e,browserTheme:t="auto"',
  rdStandalone
);
