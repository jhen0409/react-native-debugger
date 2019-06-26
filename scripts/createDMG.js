const path = require('path');
const createDMG = require('electron-installer-dmg');
const pkg = require('../package.json');

const appPath = path.join(
  __dirname,
  '../release/React Native Debugger-darwin-x64/React Native Debugger.app'
);

createDMG(
  {
    appPath,
    name: 'React Native Debugger',
    title: 'React Native Debugger',
    // https://github.com/sindresorhus/create-dmg/tree/master/assets
    background: path.join(__dirname, 'dmg-background.png'),
    icon: path.join(__dirname, '../electron/logo.icns'),
    overwrite: true,
    contents: [
      {
        x: 180,
        y: 170,
        type: 'file',
        path: appPath,
      },
      {
        x: 480,
        y: 170,
        type: 'link',
        path: '/Applications',
      },
    ],
    dmgPath: path.join(__dirname, `../release/react-native-debugger_${pkg.version}.dmg`),
  },
  err => {
    if (err) console.log(err);
  }
);
