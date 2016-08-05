#!/bin/bash

echo "[v$npm_package_version] Packaging win32..."

electron-packager dist/ \
  --overwrite \
  --platform win32 \
  --arch ia32 \
  --asar \
  --prune \
  --out release \
  --version $(npm info electron version) \
  --app-version $npm_package_version \
  --icon electron/logo.ico

cd release/React\ Native\ Debugger-win32-ia32
zip -ryq9 ../rn-debugger-win32.zip *
