#! /usr/bin/env node

const argv = require('minimist')(process.argv.slice(2), {
  boolean: ['inject', 'revert', 'desktop', 'macos'],
  default: {
    inject: true,
  },
});

require('../lib/main')(argv, (pass, dontError) => {
  if (!pass && !dontError) process.exit(1);
});
