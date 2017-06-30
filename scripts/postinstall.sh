#!/bin/bash

function rebuild {
  # electron-named-image is only for macOS
  electron-rebuild -f -w electron-named-image
}

rebuild
cd dist
yarn
rebuild
electron-rebuild -f -w electron-named-image
rm -rf node_modules/*/{example,examples,test,tests,*.md,*.markdown,CHANGELOG*,.*,Makefile}
cd -

./scripts/patch-react-devtools.sh
