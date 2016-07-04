#!/bin/bash

echo "[v$npm_package_version] Packaging linux x64..."

electron-packager dist/ \
  --overwrite \
  --platform linux \
  --arch x64 \
  --asar \
  --prune \
  --out release \
  --app-version $npm_package_version \
  --app-copyright "This software is included following project: https://github.com/facebook/react-devtools, https://github.com/zalmoxisus/remotedev-app" \
  --icon electron/logo.png

cd release/React\ Native\ Debugger-linux-x64
zip -ryq9 ../rn-debugger-linux-x64.zip *
