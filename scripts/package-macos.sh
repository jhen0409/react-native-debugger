#!/bin/bash

PACKAGE_VERSION=$(node -e "console.log(require('./package.json').version)")

echo "[v$PACKAGE_VERSION] Packaging darwin x64..."

if [ -z "$APPLE_ID" ]; then
  echo -e "Apple ID: \c"
  read APPLE_ID
fi

if [ -z "$APPLE_DEVELOPER_NAME" ]; then
  echo -e "Apple Developer Name: \c"
  read APPLE_DEVELOPER_NAME
fi

if [ -z "$APPLE_TEAM_ID" ]; then
  echo -e "Apple Team ID: \c"
  read APPLE_TEAM_ID
fi

electron-packager dist/ \
  --overwrite \
  --platform darwin \
  --arch x64 \
  --asar \
  --extra-resource=dist/devtools-helper \
  --extra-resource=dist/node_modules/apollo-client-devtools/shells/webextension \
  --no-prune \
  --out release \
  --protocol-name "React Native Debugger" \
  --protocol "rndebugger" \
  --electron-version $(node -e "console.log(require('electron/package').version)") \
  --app-version $PACKAGE_VERSION \
  --osx-sign.identity="Developer ID Application: ${APPLE_DEVELOPER_NAME} (${APPLE_TEAM_ID})" \
  --osx-sign.entitlements=scripts/mac/entitlements.plist \
  --osx-sign.entitlements-inherit=scripts/mac/entitlements.plist \
  --osx-sign.hardenedRuntime \
  --osx-notarize.appleId=$APPLE_ID \
  --osx-notarize.appleIdPassword='@keychain:AC_PASSWORD' \
  --osx-notarize.ascProvider="${APPLE_TEAM_ID}" \
  --icon electron/logo.icns \
  --darwin-dark-mode-support

node scripts/mac/createDMG.js

cd release/React\ Native\ Debugger-darwin-x64
zip -ryq9 ../rn-debugger-macos-x64.zip React\ Native\ Debugger.app

# Print codesign information
codesign -dv --verbose=4 React\ Native\ Debugger.app

echo sha256: `shasum -a 256 ../rn-debugger-macos-x64.zip`
