#! /usr/bin/env node

const argv = require('minimist')(process.argv.slice(2), {
  boolean: ['inject', 'revert', 'desktop', 'macos', 'open'],
  string: ['port'],
  default: {
    inject: true,
    port: '8081',
  },
});

let module;
argv.port = Number(argv.port);
if (argv.open && argv.port) {
  module = '../lib/open';
} else {
  module = '../lib/main';
}

require(module)(argv, (pass, dontError) => {
  if (!pass && !dontError) process.exit(1);
});
