#!/bin/bash

echo "[v$npm_package_version] Packaging win32..."

electron-packager dist/ \
  --overwrite \
  --platform win32 \
  --arch ia32 \
  --asar \
  --prune \
  --out release \
  --app-version $npm_package_version \
  --app-copyright "This software is included following project: https://github.com/facebook/react-devtools, https://github.com/zalmoxisus/remotedev-app" \
  --icon electron/logo.ico

cd release/React\ Native\ Debugger-win32-ia32
zip -ryq9 ../rn-debugger-win32.zip *
