const shell = require('shelljs');
const path = require('path');
const { rebuild } = require('electron-rebuild');

function rebuildModules(buildPath) {
  if (process.platform === 'darwin') {
    return rebuild({
      buildPath,
      // eslint-disable-next-line
      electronVersion: require('electron/package.json').version,
      extraModules: [],
      force: true,
      types: ['prod', 'optional'],
    });
  }
}

async function run() {
  shell.cd('npm-package');
  shell.exec('yarn');
  shell.cd('-');
  await rebuildModules(path.resolve(__dirname, '..'));
  shell.cd('dist');
  shell.exec('yarn');
  await rebuildModules(path.resolve(__dirname, '../dist'));
  shell.rm(
    '-rf',
    'node_modules/*/{example,examples,test,tests,*.md,*.markdown,CHANGELOG*,.*,Makefile}'
  );
  // Remove unnecessary files in apollo-client-devtools
  shell.rm(
    '-rf',
    'node_modules/apollo-client-devtools/{assets,build,development,shells/dev,src}'
  );
  // eslint-disable-next-line
  require('./patch-modules');
}

run();
