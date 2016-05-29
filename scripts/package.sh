#!/bin/bash

cp electron/main.js dist/main.js
rm -rf dist/js release/
npm run build
cd dist && npm i && cd ..
electron-packager dist/ \
  --platform darwin \
  --arch x64 \
  --asar \
  --prune \
  --out release
