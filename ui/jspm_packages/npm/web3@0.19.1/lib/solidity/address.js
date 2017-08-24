/* */ 
var f = require('./formatters');
var SolidityType = require('./type');
var SolidityTypeAddress = function() {
  this._inputFormatter = f.formatInputInt;
  this._outputFormatter = f.formatOutputAddress;
};
SolidityTypeAddress.prototype = new SolidityType({});
SolidityTypeAddress.prototype.constructor = SolidityTypeAddress;
SolidityTypeAddress.prototype.isType = function(name) {
  return !!name.match(/address(\[([0-9]*)\])?/);
};
module.exports = SolidityTypeAddress;
