#!/bin/bash

echo "[v$npm_package_version] Packaging win32..."

electron-packager dist/ \
  --executable-name "react-native-debugger" \
  --overwrite \
  --platform win32 \
  --arch x64 \
  --asar \
  --no-prune \
  --out release \
  --electron-version $(node -e "console.log(require('electron/package').version)") \
  --app-version $npm_package_version \
  --icon electron/logo.ico

electron-installer-windows --src release/React\ Native\ Debugger-win32-x64 --dest release/ --config scripts/config.json

cd release/React\ Native\ Debugger-win32-x64
zip -ryq9 ../rn-debugger-windows-x64.zip *
