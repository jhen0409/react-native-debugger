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

const flags = {
  'react-native': {
    '0.50.0-rc.0': {
      target: 'react-native',
      dir: 'local-cli/server/middleware',
      file: 'getDevToolsMiddleware.js',
      keyFunc: 'launchChromeDevTools',
      func: "function launchChromeDevTools(port, args = '') {",
      replaceFunc: "function launchChromeDevTools(port, args = '', skipRNDebugger) {",
      funcCall: '(port, args, true)',
      args: "port + '&args=' + args",
    },
    '0.53.0': {
      target: 'react-native',
      dir: 'local-cli/server/middleware',
      file: 'getDevToolsMiddleware.js',
      keyFunc: 'launchChromeDevTools',
      func: "function launchChromeDevTools(host, args = '') {",
      replaceFunc: "function launchChromeDevTools(host, args = '', skipRNDebugger) {",
      funcCall: '(host, args, true)',
      args: "(host && host.split(':')[1] || '8081') + '&args=' + args",
    },
    '0.59.0-rc.0': [
      {
        target: '@react-native-community/cli',
        dir: 'build/commands/server/middleware',
        file: 'getDevToolsMiddleware.js',
        keyFunc: 'launchChromeDevTools',
        func: "function launchChromeDevTools(port, args = '') {",
        replaceFunc: "function launchChromeDevTools(port, args = '', skipRNDebugger) {",
        funcCall: '(port, args, true)',
        args: "port + '&args=' + args",
      },
      {
        target: '@react-native-community/cli',
        dir: 'build/commands/server/middleware',
        file: 'getDevToolsMiddleware.js',
        keyFunc: 'launchDevTools',
        func: 'function launchDevTools({\n  port,\n  watchFolders\n}, isDebuggerConnected) {',
        replaceFunc:
          'function launchDevTools({port, watchFolders},' +
          ' isDebuggerConnected, skipRNDebugger) {',
        funcCall: '({port, watchFolders}, isDebuggerConnected, true)',
        args: "port + '&watchFolders=' + watchFolders.map(f => `\"${f}\"`).join(',')",
      },
    ],
  },
  'react-native-macos': {
    '0.0.0': {
      target: 'react-native-macos',
      dir: 'local-cli/server/middleware',
      file: 'getDevToolsMiddleware.js',
      keyFunc: 'launchChromeDevTools',
      func: 'function launchChromeDevTools(port) {',
      replaceFunc: 'function launchChromeDevTools(port, skipRNDebugger) {',
      funcCall: '(port, true)',
      args: 'port',
    },
  },
  // react-native
  default: {
    target: 'react-native',
    dir: 'local-cli/server/middleware',
    file: 'getDevToolsMiddleware.js',
    keyFunc: 'launchChromeDevTools',
    func: 'function launchChromeDevTools(port) {',
    replaceFunc: 'function launchChromeDevTools(port, skipRNDebugger) {',
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

const injectCode = (
  modulePath,
  { keyFunc, func: funcFlag, replaceFunc: replaceFuncFlag, funcCall, args, target, dir, file }
) => {
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
  let start = middlewareCode.indexOf(startFlag);
  let end = middlewareCode.indexOf(endFlag) + endFlag.length;
  // already injected
  if (start > -1 && middlewareCode.indexOf(replaceFuncFlag) === -1) {
    start = -1;
    end = -1;
  }
  if (start === -1) {
    start = middlewareCode.indexOf(funcFlag);
    end = start + funcFlag.length;
  }
  if (start === -1) return false;
  fs.writeFileSync(
    filePath,
    middlewareCode.substr(0, start) + code + middlewareCode.substr(end, middlewareCode.length)
  );
  return true;
};

export const inject = (modulePath, moduleName) => {
  const info = getModuleInfo(modulePath, moduleName);
  const flagList = getFlag(info.name, info.version);
  if (Array.isArray(flagList)) {
    flagList.some(flag => injectCode(modulePath, flag));
  } else {
    injectCode(modulePath, flagList);
  }
  return true;
};

const revertCode = (
  modulePath,
  { func: funcFlag, replaceFunc: replaceFuncFlag, target, dir, file }
) => {
  const filePath = join(modulePath, target, dir, file);
  if (!fs.existsSync(filePath)) return false;

  const middlewareCode = fs.readFileSync(filePath, 'utf-8');
  let start = middlewareCode.indexOf(startFlag);
  let end = middlewareCode.indexOf(endFlag) + endFlag.length;
  // already injected
  if (start > -1 && middlewareCode.indexOf(replaceFuncFlag) === -1) {
    start = -1;
    end = -1;
  }
  if (start === -1) return false;
  fs.writeFileSync(
    filePath,
    middlewareCode.substr(0, start) + funcFlag + middlewareCode.substr(end, middlewareCode.length)
  );
  return true;
};

export const revert = (modulePath, moduleName) => {
  const info = getModuleInfo(modulePath, moduleName);
  const flagList = getFlag(info.name, info.version);
  if (Array.isArray(flagList)) {
    flagList.some(flag => revertCode(modulePath, flag));
  } else {
    revertCode(modulePath, flagList);
  }
  return true;
};
