#!/bin/bash

PACKAGE_VERSION=$(node -e "console.log(require('./package.json').version)")

echo "[v$PACKAGE_VERSION] Packaging darwin x64..."

# Check arg no-notarize
if [ "$1" == "--notarize" ]; then
  NOTARIZE=1
fi

if [ "$NOTARIZE" == "1" ]; then
  if [ -z "$APPLE_DEVELOPER_NAME" ]; then
    echo -e "Apple Developer Name: \c"
    read APPLE_DEVELOPER_NAME
  fi

  if [ -z "$APPLE_TEAM_ID" ]; then
    echo -e "Apple Team ID: \c"
    read APPLE_TEAM_ID
  fi
fi

# cp apollo-client-devtools/build to ac-devtools-ext
cp -r dist/node_modules/apollo-client-devtools/build dist/node_modules/apollo-client-devtools/ac-devtools-ext-build

function build_with_arch() {
  electron-packager dist/ \
    --overwrite \
    --platform darwin \
    --arch $1 \
    --asar \
    --extra-resource=dist/devtools-helper \
    --extra-resource=dist/node_modules/apollo-client-devtools/ac-devtools-ext-build \
    --prune \
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

if [ "$NOTARIZE" == "1" ]; then
  node scripts/mac/createUniversalApp.js --notarize
else
  node scripts/mac/createUniversalApp.js
fi

node scripts/mac/createDMG.js

cd release
ditto -c -k --keepParent React\ Native\ Debugger.app rn-debugger-macos-universal.zip
cd React\ Native\ Debugger-darwin-arm64
ditto -c -k --keepParent React\ Native\ Debugger.app ../rn-debugger-macos-arm64.zip 
cd ../React\ Native\ Debugger-darwin-x64
ditto -c -k --keepParent React\ Native\ Debugger.app ../rn-debugger-macos-x64.zip
cd ..

# Print codesign information
codesign -dv --verbose=4 React\ Native\ Debugger.app

echo sha256: `shasum -a 256 rn-debugger-macos-universal.zip`
