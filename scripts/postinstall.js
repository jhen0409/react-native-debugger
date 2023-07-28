const shell = require('shelljs')

async function run() {
  shell.cd('npm-package')
  shell.exec('yarn')
  shell.cd('-')
  shell.cd('dist')
  shell.exec('yarn')
  shell.rm(
    '-rf',
    'node_modules/*/{example,examples,test,tests,*.md,*.markdown,CHANGELOG*,.*,Makefile}',
  )
  // Remove unnecessary files in apollo-client-devtools
  shell.rm(
    '-rf',
    'node_modules/apollo-client-devtools/{assets,development/dev,src}',
  )
  // eslint-disable-next-line
  require('./patch-modules')
}

run()
