#!/bin/bash

echo "[v$npm_package_version] Packaging darwin x64..."

electron-packager dist/ \
  --overwrite \
  --platform darwin \
  --arch x64 \
  --asar \
  --prune \
  --out release \
  --protocol-name "React Native Debugger" \
  --protocol "rndebugger" \
  --version $(npm info electron version)
  --app-version $npm_package_version \
  --icon electron/logo.icns

cd release/React\ Native\ Debugger-darwin-x64
zip -ryq9 ../rn-debugger-darwin-x64.zip React\ Native\ Debugger.app
