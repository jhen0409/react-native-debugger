#!/bin/bash

echo "[v$npm_package_version] Packaging linux x64..."

electron-packager dist/ \
  --executable-name "react-native-debugger" \
  --overwrite \
  --platform linux \
  --arch x64 \
  --asar \
  --no-prune \
  --out release \
  --electron-version $(node -e "console.log(require('electron/package').version)") \
  --app-version $npm_package_version

electron-installer-debian --src release/React\ Native\ Debugger-linux-x64 --dest release/ --arch amd64 --config scripts/config.json
electron-installer-redhat --src release/React\ Native\ Debugger-linux-x64 --dest release/ --arch amd64 --config scripts/config.json

cd release/React\ Native\ Debugger-linux-x64
zip -ryq9 ../rn-debugger-linux-x64.zip *
