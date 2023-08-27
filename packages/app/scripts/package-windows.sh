#!/bin/bash

PACKAGE_VERSION=$(node -e "console.log(require('./package.json').version)")

echo "[v$PACKAGE_VERSION] Packaging win32..."

# cp apollo-client-devtools/build to ac-devtools-ext
cp -r dist/node_modules/apollo-client-devtools/build dist/node_modules/apollo-client-devtools/ac-devtools-ext-build

electron-packager dist/ \
  --executable-name "react-native-debugger" \
  --overwrite \
  --platform win32 \
  --arch x64 \
  --asar \
  --extra-resource=dist/devtools-helper \
  --extra-resource=dist/node_modules/apollo-client-devtools/ac-devtools-ext-build \
  --prune \
  --out release \
  --electron-version $(node -e "console.log(require('electron/package').version)") \
  --app-version $PACKAGE_VERSION \
  --icon electron/logo.ico

electron-installer-windows --src release/React\ Native\ Debugger-win32-x64 --dest release/ --config scripts/config.json

cd release/React\ Native\ Debugger-win32-x64
npx bestzip ../rn-debugger-windows-x64.zip *
