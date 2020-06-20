#! /usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');

const defaultPort = 8081;
const expoDefaultPort = 19001;

const expoInfoPath = path.join(process.cwd(), '.expo/packager-info.json');

/* eslint-disable global-require */
const getExpoPort = () =>
  (fs.existsSync(expoInfoPath)
    ? require(expoInfoPath).packagerPort || expoDefaultPort
    : expoDefaultPort);

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
    // Use expo packager port (getExpoPort) instead of RN packager default port (8081)
    'expo',
  ],
  string: ['port', 'host'],
  default: {
    inject: true,
  },
});

let moduleName;
argv.port = Number(argv.port) || (argv.expo ? getExpoPort() : defaultPort);
if (argv.open && (argv.port || argv.host)) {
  moduleName = '../lib/open';
} else {
  moduleName = '../lib/main';
}

require(moduleName).default(argv, (pass, dontError) => {
  if (!pass && !dontError) process.exit(1);
});
