#!/bin/bash

echo "[v$npm_package_version] Packaging win32..."

electron-packager dist/ \
  --overwrite \
  --platform win32 \
  --arch ia32 \
  --asar \
  --no-prune \
  --out release \
  --electron-version $(node -e "console.log(require('electron/package').version)") \
  --app-version $npm_package_version \
  --icon electron/logo.ico

cd release/React\ Native\ Debugger-win32-ia32
zip -ryq9 ../rn-debugger-windows-ia32.zip *
