#! /usr/bin/env node

const argv = require('minimist')(process.argv.slice(2), {
  boolean: ['inject', 'revert', 'desktop', 'macos', 'open'],
  string: ['port'],
  default: {
    inject: true,
    port: '8081',
  },
});

let moduleName;
argv.port = Number(argv.port);
if (argv.open && argv.port) {
  moduleName = '../lib/open';
} else {
  moduleName = '../lib/main';
}

require(moduleName).default(argv, (pass, dontError) => {
  if (!pass && !dontError) process.exit(1);
});
