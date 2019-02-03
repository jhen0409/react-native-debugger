const electronPath = require('electron');
const { Application } = require('spectron');

module.exports = (path = 'dist') =>
  new Application({
    path: electronPath,
    args: ['--user-dir=__e2e__/tmp', path],
    env: {
      E2E_TEST: 1,
    },
  });
