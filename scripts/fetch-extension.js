/* eslint-disable import/no-extraneous-dependencies */

const fs = require('fs-extra');
const path = require('path');
const download = require(
  'electron-devtools-installer/dist/downloadChromeExtension'
).default;

const DEVTOOLS_AUTHOR = 'egfhcfdfnajldliefpdoaojgahefjhhi';

download(DEVTOOLS_AUTHOR, true)
  .then(extensionFolder => {
    fs.copy(
      extensionFolder,
      path.join(__dirname, '../dist/devtools_author'
    ), () => process.exit());
  }).catch(() => process.exit(1));
