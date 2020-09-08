"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readFile = exports.isFileExists = exports.resolvePath = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = require("path");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var resolvePath = function resolvePath(path) {
  return (0, _path.resolve)(process.cwd(), path);
};

exports.resolvePath = resolvePath;

var isFileExists = function isFileExists(path) {
  return _fs["default"].existsSync(path);
};

exports.isFileExists = isFileExists;

var readFile = function readFile(filePath) {
  return _fs["default"].readFileSync(filePath);
};

exports.readFile = readFile;