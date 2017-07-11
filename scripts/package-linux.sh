#!/bin/bash

echo "[v$npm_package_version] Packaging linux x64..."

electron-packager dist/ \
  --overwrite \
  --platform linux \
  --arch x64 \
  --asar \
  --no-prune \
  --out release \
  --electron-version $(node -e "console.log(require('electron/package').version)") \
  --app-version $npm_package_version

cd release/React\ Native\ Debugger-linux-x64
zip -ryq9 ../rn-debugger-linux-x64.zip *
