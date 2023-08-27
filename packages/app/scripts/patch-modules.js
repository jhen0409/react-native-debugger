const shell = require('shelljs')
const path = require('path')

console.log('Patch react-devtools-core')

const rdStandalone = path.join(
  __dirname,
  '../dist/node_modules/react-devtools-core/dist/standalone.js',
)

// Avoid source map not found warning
shell.sed(
  '-i',
  /sourceMappingURL=importFile\.worker\.worker\.js\.map'\]\)\),\{name:"\[name\]\.worker\.js/g,
  `sourceMappingURL_NotUsed=importFile.worker.worker.js.map'])),{name:"ReactDevToolsImportFile.worker.js`,
  rdStandalone,
)
