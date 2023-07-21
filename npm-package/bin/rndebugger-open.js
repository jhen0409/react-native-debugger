#! /usr/bin/env node

'use strict';

const defaultPort = 8081;

const argv = require('minimist')(process.argv.slice(2), {
  boolean: [
    // Inject / Revert code from react-native packager
    'inject',
    'revert',
    // Inject to react-native-desktop / react-native-macos package
    'desktop',
    'macos',
    // Open directly instead of Inject code
    'open',
  ],
  string: ['port', 'host'],
  default: {
    inject: true,
  },
});

let moduleName;
argv.port = Number(argv.port) || defaultPort;
if (argv.open && (argv.port || argv.host)) {
  moduleName = '../lib/open';
} else {
  moduleName = '../lib/main';
}

require(moduleName).default(argv, (pass, dontError) => {
  if (!pass && !dontError) process.exit(1);
});
