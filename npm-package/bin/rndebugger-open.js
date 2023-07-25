#! /usr/bin/env node

'use strict'

const defaultPort = 8081

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
})

argv.port = Number(argv.port) || defaultPort

let mod
if (argv.open && (argv.port || argv.host)) {
  mod = require('../lib/open')
} else {
  mod = require('../lib/main')
}

mod.default(argv, (pass, dontError) => {
  if (!pass && !dontError) process.exit(1)
})
