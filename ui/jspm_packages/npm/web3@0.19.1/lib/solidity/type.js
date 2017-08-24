/* */ 
var f = require('./formatters');
var SolidityParam = require('./param');
var SolidityType = function(config) {
  this._inputFormatter = config.inputFormatter;
  this._outputFormatter = config.outputFormatter;
};
SolidityType.prototype.isType = function(name) {
  throw "this method should be overrwritten for type " + name;
};
SolidityType.prototype.staticPartLength = function(name) {
  return (this.nestedTypes(name) || ['[1]']).map(function(type) {
    return parseInt(type.slice(1, -1), 10) || 1;
  }).reduce(function(previous, current) {
    return previous * current;
  }, 32);
};
SolidityType.prototype.isDynamicArray = function(name) {
  var nestedTypes = this.nestedTypes(name);
  return !!nestedTypes && !nestedTypes[nestedTypes.length - 1].match(/[0-9]{1,}/g);
};
SolidityType.prototype.isStaticArray = function(name) {
  var nestedTypes = this.nestedTypes(name);
  return !!nestedTypes && !!nestedTypes[nestedTypes.length - 1].match(/[0-9]{1,}/g);
};
SolidityType.prototype.staticArrayLength = function(name) {
  var nestedTypes = this.nestedTypes(name);
  if (nestedTypes) {
    return parseInt(nestedTypes[nestedTypes.length - 1].match(/[0-9]{1,}/g) || 1);
  }
  return 1;
};
SolidityType.prototype.nestedName = function(name) {
  var nestedTypes = this.nestedTypes(name);
  if (!nestedTypes) {
    return name;
  }
  return name.substr(0, name.length - nestedTypes[nestedTypes.length - 1].length);
};
SolidityType.prototype.isDynamicType = function() {
  return false;
};
SolidityType.prototype.nestedTypes = function(name) {
  return name.match(/(\[[0-9]*\])/g);
};
SolidityType.prototype.encode = function(value, name) {
  var self = this;
  if (this.isDynamicArray(name)) {
    return (function() {
      var length = value.length;
      var nestedName = self.nestedName(name);
      var result = [];
      result.push(f.formatInputInt(length).encode());
      value.forEach(function(v) {
        result.push(self.encode(v, nestedName));
      });
      return result;
    })();
  } else if (this.isStaticArray(name)) {
    return (function() {
      var length = self.staticArrayLength(name);
      var nestedName = self.nestedName(name);
      var result = [];
      for (var i = 0; i < length; i++) {
        result.push(self.encode(value[i], nestedName));
      }
      return result;
    })();
  }
  return this._inputFormatter(value, name).encode();
};
SolidityType.prototype.decode = function(bytes, offset, name) {
  var self = this;
  if (this.isDynamicArray(name)) {
    return (function() {
      var arrayOffset = parseInt('0x' + bytes.substr(offset * 2, 64));
      var length = parseInt('0x' + bytes.substr(arrayOffset * 2, 64));
      var arrayStart = arrayOffset + 32;
      var nestedName = self.nestedName(name);
      var nestedStaticPartLength = self.staticPartLength(nestedName);
      var roundedNestedStaticPartLength = Math.floor((nestedStaticPartLength + 31) / 32) * 32;
      var result = [];
      for (var i = 0; i < length * roundedNestedStaticPartLength; i += roundedNestedStaticPartLength) {
        result.push(self.decode(bytes, arrayStart + i, nestedName));
      }
      return result;
    })();
  } else if (this.isStaticArray(name)) {
    return (function() {
      var length = self.staticArrayLength(name);
      var arrayStart = offset;
      var nestedName = self.nestedName(name);
      var nestedStaticPartLength = self.staticPartLength(nestedName);
      var roundedNestedStaticPartLength = Math.floor((nestedStaticPartLength + 31) / 32) * 32;
      var result = [];
      for (var i = 0; i < length * roundedNestedStaticPartLength; i += roundedNestedStaticPartLength) {
        result.push(self.decode(bytes, arrayStart + i, nestedName));
      }
      return result;
    })();
  } else if (this.isDynamicType(name)) {
    return (function() {
      var dynamicOffset = parseInt('0x' + bytes.substr(offset * 2, 64));
      var length = parseInt('0x' + bytes.substr(dynamicOffset * 2, 64));
      var roundedLength = Math.floor((length + 31) / 32);
      var param = new SolidityParam(bytes.substr(dynamicOffset * 2, (1 + roundedLength) * 64), 0);
      return self._outputFormatter(param, name);
    })();
  }
  var length = this.staticPartLength(name);
  var param = new SolidityParam(bytes.substr(offset * 2, length * 2));
  return this._outputFormatter(param, name);
};
module.exports = SolidityType;
