#!/bin/bash

echo "[v$npm_package_version] Packaging darwin x64..."

echo -e "Apple ID: \c"
read appleId

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
  --app-version $npm_package_version \
  --app-bundle-id='com.rndebugger' \
  --osx-sign.identity='Developer ID Application: Jhen Jie Hong (C6EUM5DVB3)' \
  --osx-sign.entitlements=scripts/mac/entitlements.plist \
  --osx-sign.entitlements-inherit=scripts/mac/entitlements.plist \
  --osx-sign.hardenedRuntime \
  --osx-notarize.appleId=$appleId \
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
