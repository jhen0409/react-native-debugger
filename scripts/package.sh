#!/bin/bash

rm -rf dist/js release/
npm run build
cd dist && npm i && cd ..
electron-packager dist/ \
  --platform darwin \
  --arch x64 \
  --asar \
  --prune \
  --out release \
  --app-version $(node -p -e "require('./package.json').version") \
  --app-copyright "This software is included following project: https://github.com/facebook/react-devtools, https://github.com/zalmoxisus/remotedev-app" \
  --icon electron/logo.icns
