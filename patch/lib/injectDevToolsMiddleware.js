'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.revert = exports.inject = exports.path = exports.file = exports.dir = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _es6Template = require('es6-template');

var _es6Template2 = _interopRequireDefault(_es6Template);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const template = _fs2.default.readFileSync((0, _path.join)(__dirname, 'injectDevToolsMiddleware.tmpl.js'), 'utf-8');

const name = 'react-native-debugger-patch';
const startFlag = `/* ${name} start */`;
const endFlag = `/* ${name} end */`;
const keyFunc = 'launchChromeDevTools';
const funcFlag = `function ${keyFunc}(port) {`;
const replaceFuncFlag = `function ${keyFunc}(port, skipRNDebugger) {`;

const dir = exports.dir = 'local-cli/server/middleware';
const file = exports.file = 'getDevToolsMiddleware.js';
const path = exports.path = (0, _path.join)(exports.dir, exports.file);

const inject = exports.inject = modulePath => {
  const filePath = (0, _path.join)(modulePath, exports.path);
  if (!_fs2.default.existsSync(filePath)) return false;

  const code = (0, _es6Template2.default)(template, {
    startFlag: startFlag,
    replaceFuncFlag: replaceFuncFlag,
    keyFunc: keyFunc,
    endFlag: endFlag
  });

  const middlewareCode = _fs2.default.readFileSync(filePath, 'utf-8');
  let start = middlewareCode.indexOf(startFlag); // already injected ?
  let end = middlewareCode.indexOf(endFlag) + endFlag.length;
  if (start === -1) {
    start = middlewareCode.indexOf(funcFlag);
    end = start + funcFlag.length;
  }
  _fs2.default.writeFileSync(filePath, middlewareCode.substr(0, start) + code + middlewareCode.substr(end, middlewareCode.length));
  return true;
};

const revert = exports.revert = modulePath => {
  const filePath = (0, _path.join)(modulePath, exports.path);
  if (!_fs2.default.existsSync(filePath)) return false;

  const middlewareCode = _fs2.default.readFileSync(filePath, 'utf-8');
  const start = middlewareCode.indexOf(startFlag); // already injected ?
  const end = middlewareCode.indexOf(endFlag) + endFlag.length;
  if (start !== -1) {
    _fs2.default.writeFileSync(filePath, middlewareCode.substr(0, start) + funcFlag + middlewareCode.substr(end, middlewareCode.length));
  }
  return true;
};