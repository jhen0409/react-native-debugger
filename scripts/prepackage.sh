#!/bin/bash

npm run build
cd dist
npm i
rm -rf node_modules/*/{example,examples,test,tests,*.md,*.markdown,CHANGELOG*,.*,Makefile}
cd -

./scripts/patch-react-devtools.sh
