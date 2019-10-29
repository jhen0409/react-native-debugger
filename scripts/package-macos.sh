#!/bin/bash

PACKAGE_VERSION=$(node -e "console.log(require('./package.json').version)")

echo "[v$PACKAGE_VERSION] Packaging darwin x64..."

if [ -z "$APPLE_ID" ]; then
  echo -e "Apple ID: \c"
  read APPLE_ID
fi

electron-packager dist/ \
  --overwrite \
  --platform darwin \
  --arch x64 \
  --asar \
  --no-prune \
  --out release \
  --protocol-name "React Native Debugger" \
  --protocol "rndebugger" \
  --electron-version $(node -e "console.log(require('electron/package').version)") \
  --app-version $PACKAGE_VERSION \
  --osx-sign.identity='Developer ID Application: Jhen Jie Hong (C6EUM5DVB3)' \
  --osx-sign.entitlements=scripts/mac/entitlements.plist \
  --osx-sign.entitlements-inherit=scripts/mac/entitlements.plist \
  --osx-sign.hardenedRuntime \
  --osx-notarize.appleId=$APPLE_ID \
  --osx-notarize.appleIdPassword='@keychain:AC_PASSWORD' \
  --osx-notarize.ascProvider='C6EUM5DVB3' \
  --icon electron/logo.icns \
  --darwin-dark-mode-support

node scripts/mac/createDMG.js

cd release/React\ Native\ Debugger-darwin-x64
zip -ryq9 ../rn-debugger-macos-x64.zip React\ Native\ Debugger.app

# Print codesign information
codesign -dv --verbose=4 React\ Native\ Debugger.app

echo sha256: `shasum -a 256 ../rn-debugger-macos-x64.zip`
