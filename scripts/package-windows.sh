#!/bin/bash

PACKAGE_VERSION=$(node -e "console.log(require('./package.json').version)")

echo "[v$PACKAGE_VERSION] Packaging win32..."

electron-packager dist/ \
  --executable-name "react-native-debugger" \
  --overwrite \
  --platform win32 \
  --arch x64 \
  --asar \
  --no-prune \
  --out release \
  --electron-version $(node -e "console.log(require('electron/package').version)") \
  --app-version $PACKAGE_VERSION \
  --icon electron/logo.ico

electron-installer-windows \
  # TODO: Fix MSI issue
  --noMsi \
  --src release/React\ Native\ Debugger-win32-x64 \
  --dest release/ \
  --config scripts/config.json

cd release/React\ Native\ Debugger-win32-x64
npx bestzip ../rn-debugger-windows-x64.zip *
