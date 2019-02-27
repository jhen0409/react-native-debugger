import fs from 'fs';
import { join } from 'path';
import es6Template from 'es6-template';
import semver from 'semver';

const tmplPath = join(__dirname, 'injectDevToolsMiddleware.tmpl.js');
const tmplPathInDev = join(__dirname, '../lib/injectDevToolsMiddleware.tmpl.js');

const template = fs.readFileSync(fs.existsSync(tmplPath) ? tmplPath : tmplPathInDev, 'utf-8');

const name = 'react-native-debugger-patch';
const startFlag = `/* ${name} start */`;
const endFlag = `/* ${name} end */`;
const keyFunc = 'launchChromeDevTools';

const flags = {
  'react-native': {
    '0.50.0-rc.0': {
      target: 'react-native',
      dir: 'local-cli/server/middleware',
      file: 'getDevToolsMiddleware.js',
      func: `function ${keyFunc}(port, args = '') {`,
      replaceFunc: `function ${keyFunc}(port, args = '', skipRNDebugger) {`,
      funcCall: '(port, args, true)',
      args: "port + '&args=' + args",
    },
    '0.53.0': {
      target: 'react-native',
      dir: 'local-cli/server/middleware',
      file: 'getDevToolsMiddleware.js',
      func: `function ${keyFunc}(host, args = '') {`,
      replaceFunc: `function ${keyFunc}(host, args = '', skipRNDebugger) {`,
      funcCall: '(host, args, true)',
      args: "(host && host.split(':')[1] || '8081') + '&args=' + args",
    },
    '0.59.0-rc.0': {
      target: '@react-native-community/cli',
      dir: 'build/server/middleware',
      file: 'getDevToolsMiddleware.js',
      func: `function ${keyFunc}(host, port, args = '') {`,
      replaceFunc: `function ${keyFunc}(host, port, args = '', skipRNDebugger) {`,
      funcCall: '(host, port, args, true)',
      args: "(host && host.split(':')[1] || '8081') + '&args=' + args",
    },
  },
  'react-native-macos': {
    '0.0.0': {
      target: 'react-native-macos',
      dir: 'local-cli/server/middleware',
      file: 'getDevToolsMiddleware.js',
      func: `function ${keyFunc}(port) {`,
      replaceFunc: `function ${keyFunc}(port, skipRNDebugger) {`,
      funcCall: '(port, true)',
      args: 'port',
    },
  },
  // react-native
  default: {
    target: 'react-native',
    dir: 'local-cli/server/middleware',
    file: 'getDevToolsMiddleware.js',
    func: `function ${keyFunc}(port) {`,
    replaceFunc: `function ${keyFunc}(port, skipRNDebugger) {`,
    funcCall: '(port, true)',
    args: 'port',
  },
};

const getModuleInfo = (modulePath, moduleName) => {
  const pkg = JSON.parse(fs.readFileSync(join(modulePath, moduleName, 'package.json'))); // eslint-disable-line
  return { version: pkg.version, name: pkg.name };
};

function getFlag(moduleName, version) {
  const list = flags[moduleName || 'react-native'] || {};
  const versions = Object.keys(list);
  let flag = flags.default;
  for (let i = 0; i < versions.length; i++) {
    if (semver.gte(version, versions[i])) {
      flag = list[versions[i]];
    }
  }
  return flag;
}

export const inject = (modulePath, moduleName) => {
  const info = getModuleInfo(modulePath, moduleName);
  const {
    func: funcFlag,
    replaceFunc: replaceFuncFlag,
    funcCall,
    args,
    target,
    dir,
    file,
  } = getFlag(info.name, info.version);
  const filePath = join(modulePath, target, dir, file);
  if (!fs.existsSync(filePath)) return false;

  const code = es6Template(template, {
    startFlag,
    replaceFuncFlag,
    keyFunc,
    funcCall,
    endFlag,
    args,
  });

  const middlewareCode = fs.readFileSync(filePath, 'utf-8');
  let start = middlewareCode.indexOf(startFlag); // already injected ?
  let end = middlewareCode.indexOf(endFlag) + endFlag.length;
  if (start === -1) {
    start = middlewareCode.indexOf(funcFlag);
    end = start + funcFlag.length;
  }
  fs.writeFileSync(
    filePath,
    middlewareCode.substr(0, start) + code + middlewareCode.substr(end, middlewareCode.length)
  );
  return true;
};

export const revert = (modulePath, moduleName) => {
  const info = getModuleInfo(modulePath, moduleName);
  const { func: funcFlag, target, dir, file } = getFlag(info.name, info.version);
  const filePath = join(modulePath, target, dir, file);
  if (!fs.existsSync(filePath)) return false;

  const middlewareCode = fs.readFileSync(filePath, 'utf-8');
  const start = middlewareCode.indexOf(startFlag); // already injected ?
  const end = middlewareCode.indexOf(endFlag) + endFlag.length;
  if (start !== -1) {
    fs.writeFileSync(
      filePath,
      middlewareCode.substr(0, start) + funcFlag + middlewareCode.substr(end, middlewareCode.length)
    );
  }
  return true;
};
