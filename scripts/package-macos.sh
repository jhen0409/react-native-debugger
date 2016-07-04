#!/bin/bash

echo "[v$npm_package_version] Packaging darwin x64..."

electron-packager dist/ \
  --overwrite \
  --platform darwin \
  --arch x64 \
  --asar \
  --prune \
  --out release \
  --protocol-name "React Native Debugger" \
  --protocol "rndebugger" \
  --app-version $npm_package_version \
  --app-copyright "This software is included following project: https://github.com/facebook/react-devtools, https://github.com/zalmoxisus/remotedev-app" \
  --icon electron/logo.icns

rm release/rn-debugger-darwin-x64.dmg
npm i -g appdmg
appdmg appdmg.json release/rn-debugger-darwin-x64.dmg
