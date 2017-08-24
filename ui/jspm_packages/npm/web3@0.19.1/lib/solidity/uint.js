/* */ 
var f = require('./formatters');
var SolidityType = require('./type');
var SolidityTypeUInt = function() {
  this._inputFormatter = f.formatInputInt;
  this._outputFormatter = f.formatOutputUInt;
};
SolidityTypeUInt.prototype = new SolidityType({});
SolidityTypeUInt.prototype.constructor = SolidityTypeUInt;
SolidityTypeUInt.prototype.isType = function(name) {
  return !!name.match(/^uint([0-9]*)?(\[([0-9]*)\])*$/);
};
module.exports = SolidityTypeUInt;
