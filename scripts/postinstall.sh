#!/bin/bash

platform=`uname`

function rebuild {
  # electron-named-image is only for macOS
  if [[ "$platform" == 'Darwin' ]]; then
    electron-rebuild -f -w electron-named-image -t prod,optional
  fi
}

rebuild
cd dist
yarn
rebuild
rm -rf node_modules/*/{example,examples,test,tests,*.md,*.markdown,CHANGELOG*,.*,Makefile}
cd -

./scripts/patch-modules.sh
