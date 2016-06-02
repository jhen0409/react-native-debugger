#! /usr/bin/env node

const argv = require('minimist')(process.argv.slice(2), {
  boolean: ['inject', 'revert', 'desktop'],
  default: {
    inject: true,
  },
});

require('../lib/main')(argv, (pass) => {
  if (!pass) process.exit(1);
});
