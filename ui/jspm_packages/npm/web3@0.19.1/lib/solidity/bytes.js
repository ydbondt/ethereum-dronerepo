/* */ 
var f = require('./formatters');
var SolidityType = require('./type');
var SolidityTypeBytes = function() {
  this._inputFormatter = f.formatInputBytes;
  this._outputFormatter = f.formatOutputBytes;
};
SolidityTypeBytes.prototype = new SolidityType({});
SolidityTypeBytes.prototype.constructor = SolidityTypeBytes;
SolidityTypeBytes.prototype.isType = function(name) {
  return !!name.match(/^bytes([0-9]{1,})(\[([0-9]*)\])*$/);
};
module.exports = SolidityTypeBytes;
