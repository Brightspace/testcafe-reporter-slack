"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.quote = exports.code = exports.strike = exports.italics = exports.bold = void 0;

var bold = function bold(text) {
  return "*".concat(text, "*");
};

exports.bold = bold;

var italics = function italics(text) {
  return "_".concat(text, "_");
};

exports.italics = italics;

var strike = function strike(text) {
  return "~".concat(text, "~");
};

exports.strike = strike;

var code = function code(text) {
  return "`".concat(text, "`");
};

exports.code = code;

var quote = function quote(text) {
  return ">".concat(text);
};

exports.quote = quote;