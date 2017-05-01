#! /usr/bin/env node

const defaultPort = 8081;
const expoDefaultPort = 19001;

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
    // Use expo default port (19000) instead of RN packager default port (8081)
    'expo',
  ],
  string: ['port'],
  default: {
    inject: true,
  },
});

let moduleName;
argv.port = Number(argv.port) || (argv.expo ? expoDefaultPort : defaultPort);
if (argv.open && argv.port) {
  moduleName = '../lib/open';
} else {
  moduleName = '../lib/main';
}

require(moduleName).default(argv, (pass, dontError) => {
  if (!pass && !dontError) process.exit(1);
});
