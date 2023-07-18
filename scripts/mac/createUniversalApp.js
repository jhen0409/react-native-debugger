const path = require('path');
const { version: electronVersion } = require('electron/package.json');
const { makeUniversalApp } = require('@electron/universal');
const { signAsync } = require('@electron/osx-sign');
const { notarize } = require('@electron/notarize');

const noNotarize = process.argv.includes('--no-notarize');

const developerId = `${process.env.APPLE_DEVELOPER_NAME} (${process.env.APPLE_TEAM_ID})`;

async function run() {
  const appPath = path.join(
    __dirname,
    '../../release/React Native Debugger.app',
  );
  const x64AppPath = path.join(
    __dirname,
    '../../release/React Native Debugger-darwin-x64/React Native Debugger.app',
  );
  const arm64AppPath = path.join(
    __dirname,
    '../../release/React Native Debugger-darwin-arm64/React Native Debugger.app',
  );
  await makeUniversalApp({
    force: true,
    x64AppPath,
    arm64AppPath,
    outAppPath: appPath,
  });

  if (noNotarize) return;

  const pathes = [appPath, x64AppPath, arm64AppPath];
  for (const p of pathes) {
    try {
      await signAsync({
        app: p,
        identity: `Developer ID Application: ${developerId}`,
        optionsForFile: () => ({
          hardenedRuntime: true,
          entitlements: 'scripts/mac/entitlements.plist',
        }),
        platform: 'darwin',
        version: electronVersion,
      });
    } catch (e) {
      console.log(e);
    }
    await notarize({
      tool: 'notarytool',
      // xcrun notarytool store-credentials "AC_PASSWORD"
      //  --apple-id "xxx" --team-id "xxx" --password "<app-specific-password>"
      keychainProfile: 'AC_PASSWORD',
      appPath: p,
    });
  }
}

run();
