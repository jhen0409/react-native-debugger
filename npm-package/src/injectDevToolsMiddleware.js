import fs from 'fs';
import { join } from 'path';
import es6Template from 'es6-template';

const template = fs.readFileSync(
  join(__dirname, 'injectDevToolsMiddleware.tmpl.js'),
  'utf-8'
);

const name = 'react-native-debugger-patch';
const startFlag = `/* ${name} start */`;
const endFlag = `/* ${name} end */`;
const keyFunc = 'launchChromeDevTools';
const funcFlag = `function ${keyFunc}(port) {`;
const replaceFuncFlag = `function ${keyFunc}(port, skipRNDebugger) {`;

export const dir = 'local-cli/server/middleware';
export const file = 'getDevToolsMiddleware.js';
export const path = join(exports.dir, exports.file);

export const inject = modulePath => {
  const filePath = join(modulePath, exports.path);
  if (!fs.existsSync(filePath)) return false;

  const code = es6Template(template, {
    startFlag,
    replaceFuncFlag,
    keyFunc,
    endFlag,
  });

  const middlewareCode = fs.readFileSync(filePath, 'utf-8');
  let start = middlewareCode.indexOf(startFlag);  // already injected ?
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

export const revert = modulePath => {
  const filePath = join(modulePath, exports.path);
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
