/* */ 
var BigNumber = require('bignumber.js');
var utils = require('../utils/utils');
var c = require('../utils/config');
var SolidityParam = require('./param');
var formatInputInt = function(value) {
  BigNumber.config(c.ETH_BIGNUMBER_ROUNDING_MODE);
  var result = utils.padLeft(utils.toTwosComplement(value).toString(16), 64);
  return new SolidityParam(result);
};
var formatInputBytes = function(value) {
  var result = utils.toHex(value).substr(2);
  var l = Math.floor((result.length + 63) / 64);
  result = utils.padRight(result, l * 64);
  return new SolidityParam(result);
};
var formatInputDynamicBytes = function(value) {
  var result = utils.toHex(value).substr(2);
  var length = result.length / 2;
  var l = Math.floor((result.length + 63) / 64);
  result = utils.padRight(result, l * 64);
  return new SolidityParam(formatInputInt(length).value + result);
};
var formatInputString = function(value) {
  var result = utils.fromUtf8(value).substr(2);
  var length = result.length / 2;
  var l = Math.floor((result.length + 63) / 64);
  result = utils.padRight(result, l * 64);
  return new SolidityParam(formatInputInt(length).value + result);
};
var formatInputBool = function(value) {
  var result = '000000000000000000000000000000000000000000000000000000000000000' + (value ? '1' : '0');
  return new SolidityParam(result);
};
var formatInputReal = function(value) {
  return formatInputInt(new BigNumber(value).times(new BigNumber(2).pow(128)));
};
var signedIsNegative = function(value) {
  return (new BigNumber(value.substr(0, 1), 16).toString(2).substr(0, 1)) === '1';
};
var formatOutputInt = function(param) {
  var value = param.staticPart() || "0";
  if (signedIsNegative(value)) {
    return new BigNumber(value, 16).minus(new BigNumber('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16)).minus(1);
  }
  return new BigNumber(value, 16);
};
var formatOutputUInt = function(param) {
  var value = param.staticPart() || "0";
  return new BigNumber(value, 16);
};
var formatOutputReal = function(param) {
  return formatOutputInt(param).dividedBy(new BigNumber(2).pow(128));
};
var formatOutputUReal = function(param) {
  return formatOutputUInt(param).dividedBy(new BigNumber(2).pow(128));
};
var formatOutputBool = function(param) {
  return param.staticPart() === '0000000000000000000000000000000000000000000000000000000000000001' ? true : false;
};
var formatOutputBytes = function(param, name) {
  var matches = name.match(/^bytes([0-9]*)/);
  var size = parseInt(matches[1]);
  return '0x' + param.staticPart().slice(0, 2 * size);
};
var formatOutputDynamicBytes = function(param) {
  var length = (new BigNumber(param.dynamicPart().slice(0, 64), 16)).toNumber() * 2;
  return '0x' + param.dynamicPart().substr(64, length);
};
var formatOutputString = function(param) {
  var length = (new BigNumber(param.dynamicPart().slice(0, 64), 16)).toNumber() * 2;
  return utils.toUtf8(param.dynamicPart().substr(64, length));
};
var formatOutputAddress = function(param) {
  var value = param.staticPart();
  return "0x" + value.slice(value.length - 40, value.length);
};
module.exports = {
  formatInputInt: formatInputInt,
  formatInputBytes: formatInputBytes,
  formatInputDynamicBytes: formatInputDynamicBytes,
  formatInputString: formatInputString,
  formatInputBool: formatInputBool,
  formatInputReal: formatInputReal,
  formatOutputInt: formatOutputInt,
  formatOutputUInt: formatOutputUInt,
  formatOutputReal: formatOutputReal,
  formatOutputUReal: formatOutputUReal,
  formatOutputBool: formatOutputBool,
  formatOutputBytes: formatOutputBytes,
  formatOutputDynamicBytes: formatOutputDynamicBytes,
  formatOutputString: formatOutputString,
  formatOutputAddress: formatOutputAddress
};
