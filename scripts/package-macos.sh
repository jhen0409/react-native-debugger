#!/bin/bash

echo "[v$npm_package_version] Packaging darwin x64..."

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
  --osx-sign='Developer ID Application: Jhen Jie Hong (C6EUM5DVB3)' \
  --icon electron/logo.icns \
  --darwin-dark-mode-support

cd release/React\ Native\ Debugger-darwin-x64
zip -ryq9 ../rn-debugger-macos-x64.zip React\ Native\ Debugger.app

echo sha256: `shasum -a 256 ../rn-debugger-macos-x64.zip`
echo "After release run: \`brew cask _appcast_checkpoint --calculate \"https://github.com/jhen0409/react-native-debugger/releases.atom\"\`"
