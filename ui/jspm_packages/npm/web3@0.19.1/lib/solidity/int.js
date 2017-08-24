/* */ 
var f = require('./formatters');
var SolidityType = require('./type');
var SolidityTypeInt = function() {
  this._inputFormatter = f.formatInputInt;
  this._outputFormatter = f.formatOutputInt;
};
SolidityTypeInt.prototype = new SolidityType({});
SolidityTypeInt.prototype.constructor = SolidityTypeInt;
SolidityTypeInt.prototype.isType = function(name) {
  return !!name.match(/^int([0-9]*)?(\[([0-9]*)\])*$/);
};
module.exports = SolidityTypeInt;
