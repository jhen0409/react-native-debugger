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

function build_with_arch() {
  electron-packager dist/ \
    --overwrite \
    --platform darwin \
    --arch $1 \
    --asar \
    --extra-resource=dist/devtools-helper \
    --extra-resource=dist/node_modules/apollo-client-devtools/shells/webextension \
    --no-prune \
    --out release \
    --protocol-name "React Native Debugger" \
    --protocol "rndebugger" \
    --electron-version $(node -e "console.log(require('electron/package').version)") \
    --app-version $PACKAGE_VERSION \
    --icon electron/logo.icns \
    --darwin-dark-mode-support
}

build_with_arch x64
build_with_arch arm64

node scripts/mac/createUniversalApp.js
node scripts/mac/createDMG.js

cd release
zip -ryq9 rn-debugger-macos-universal.zip React\ Native\ Debugger.app
cd React\ Native\ Debugger-darwin-arm64
zip -ryq9 ../rn-debugger-macos-arm64.zip React\ Native\ Debugger.app
cd ../React\ Native\ Debugger-darwin-x64
zip -ryq9 ../rn-debugger-macos-x64.zip React\ Native\ Debugger.app
cd ..

# Print codesign information
codesign -dv --verbose=4 React\ Native\ Debugger.app

echo sha256: `shasum -a 256 rn-debugger-macos-universal.zip`
