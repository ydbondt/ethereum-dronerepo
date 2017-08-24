/* */ 
var utils = require('../utils/utils');
var SolidityParam = function(value, offset) {
  this.value = value || '';
  this.offset = offset;
};
SolidityParam.prototype.dynamicPartLength = function() {
  return this.dynamicPart().length / 2;
};
SolidityParam.prototype.withOffset = function(offset) {
  return new SolidityParam(this.value, offset);
};
SolidityParam.prototype.combine = function(param) {
  return new SolidityParam(this.value + param.value);
};
SolidityParam.prototype.isDynamic = function() {
  return this.offset !== undefined;
};
SolidityParam.prototype.offsetAsBytes = function() {
  return !this.isDynamic() ? '' : utils.padLeft(utils.toTwosComplement(this.offset).toString(16), 64);
};
SolidityParam.prototype.staticPart = function() {
  if (!this.isDynamic()) {
    return this.value;
  }
  return this.offsetAsBytes();
};
SolidityParam.prototype.dynamicPart = function() {
  return this.isDynamic() ? this.value : '';
};
SolidityParam.prototype.encode = function() {
  return this.staticPart() + this.dynamicPart();
};
SolidityParam.encodeList = function(params) {
  var totalOffset = params.length * 32;
  var offsetParams = params.map(function(param) {
    if (!param.isDynamic()) {
      return param;
    }
    var offset = totalOffset;
    totalOffset += param.dynamicPartLength();
    return param.withOffset(offset);
  });
  return offsetParams.reduce(function(result, param) {
    return result + param.dynamicPart();
  }, offsetParams.reduce(function(result, param) {
    return result + param.staticPart();
  }, ''));
};
module.exports = SolidityParam;
