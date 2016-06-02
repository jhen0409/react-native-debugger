#! /usr/bin/env node

const argv = require('minimist')(process.argv.slice(2), {
  boolean: ['inject', 'revert', 'desktop'],
  default: {
    inject: true,
  },
});

const result = require('../lib/main')(argv);
if (!result) process.exit(1);