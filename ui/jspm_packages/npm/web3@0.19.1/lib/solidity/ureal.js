/* */ 
var f = require('./formatters');
var SolidityType = require('./type');
var SolidityTypeUReal = function() {
  this._inputFormatter = f.formatInputReal;
  this._outputFormatter = f.formatOutputUReal;
};
SolidityTypeUReal.prototype = new SolidityType({});
SolidityTypeUReal.prototype.constructor = SolidityTypeUReal;
SolidityTypeUReal.prototype.isType = function(name) {
  return !!name.match(/^ureal([0-9]*)?(\[([0-9]*)\])*$/);
};
module.exports = SolidityTypeUReal;
