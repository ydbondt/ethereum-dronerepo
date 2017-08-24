/* */ 
var f = require('./formatters');
var SolidityTypeAddress = require('./address');
var SolidityTypeBool = require('./bool');
var SolidityTypeInt = require('./int');
var SolidityTypeUInt = require('./uint');
var SolidityTypeDynamicBytes = require('./dynamicbytes');
var SolidityTypeString = require('./string');
var SolidityTypeReal = require('./real');
var SolidityTypeUReal = require('./ureal');
var SolidityTypeBytes = require('./bytes');
var isDynamic = function(solidityType, type) {
  return solidityType.isDynamicType(type) || solidityType.isDynamicArray(type);
};
var SolidityCoder = function(types) {
  this._types = types;
};
SolidityCoder.prototype._requireType = function(type) {
  var solidityType = this._types.filter(function(t) {
    return t.isType(type);
  })[0];
  if (!solidityType) {
    throw Error('invalid solidity type!: ' + type);
  }
  return solidityType;
};
SolidityCoder.prototype.encodeParam = function(type, param) {
  return this.encodeParams([type], [param]);
};
SolidityCoder.prototype.encodeParams = function(types, params) {
  var solidityTypes = this.getSolidityTypes(types);
  var encodeds = solidityTypes.map(function(solidityType, index) {
    return solidityType.encode(params[index], types[index]);
  });
  var dynamicOffset = solidityTypes.reduce(function(acc, solidityType, index) {
    var staticPartLength = solidityType.staticPartLength(types[index]);
    var roundedStaticPartLength = Math.floor((staticPartLength + 31) / 32) * 32;
    return acc + (isDynamic(solidityTypes[index], types[index]) ? 32 : roundedStaticPartLength);
  }, 0);
  var result = this.encodeMultiWithOffset(types, solidityTypes, encodeds, dynamicOffset);
  return result;
};
SolidityCoder.prototype.encodeMultiWithOffset = function(types, solidityTypes, encodeds, dynamicOffset) {
  var result = "";
  var self = this;
  types.forEach(function(type, i) {
    if (isDynamic(solidityTypes[i], types[i])) {
      result += f.formatInputInt(dynamicOffset).encode();
      var e = self.encodeWithOffset(types[i], solidityTypes[i], encodeds[i], dynamicOffset);
      dynamicOffset += e.length / 2;
    } else {
      result += self.encodeWithOffset(types[i], solidityTypes[i], encodeds[i], dynamicOffset);
    }
  });
  types.forEach(function(type, i) {
    if (isDynamic(solidityTypes[i], types[i])) {
      var e = self.encodeWithOffset(types[i], solidityTypes[i], encodeds[i], dynamicOffset);
      dynamicOffset += e.length / 2;
      result += e;
    }
  });
  return result;
};
SolidityCoder.prototype.encodeWithOffset = function(type, solidityType, encoded, offset) {
  var self = this;
  if (solidityType.isDynamicArray(type)) {
    return (function() {
      var nestedName = solidityType.nestedName(type);
      var nestedStaticPartLength = solidityType.staticPartLength(nestedName);
      var result = encoded[0];
      (function() {
        var previousLength = 2;
        if (solidityType.isDynamicArray(nestedName)) {
          for (var i = 1; i < encoded.length; i++) {
            previousLength += +(encoded[i - 1])[0] || 0;
            result += f.formatInputInt(offset + i * nestedStaticPartLength + previousLength * 32).encode();
          }
        }
      })();
      (function() {
        for (var i = 0; i < encoded.length - 1; i++) {
          var additionalOffset = result / 2;
          result += self.encodeWithOffset(nestedName, solidityType, encoded[i + 1], offset + additionalOffset);
        }
      })();
      return result;
    })();
  } else if (solidityType.isStaticArray(type)) {
    return (function() {
      var nestedName = solidityType.nestedName(type);
      var nestedStaticPartLength = solidityType.staticPartLength(nestedName);
      var result = "";
      if (solidityType.isDynamicArray(nestedName)) {
        (function() {
          var previousLength = 0;
          for (var i = 0; i < encoded.length; i++) {
            previousLength += +(encoded[i - 1] || [])[0] || 0;
            result += f.formatInputInt(offset + i * nestedStaticPartLength + previousLength * 32).encode();
          }
        })();
      }
      (function() {
        for (var i = 0; i < encoded.length; i++) {
          var additionalOffset = result / 2;
          result += self.encodeWithOffset(nestedName, solidityType, encoded[i], offset + additionalOffset);
        }
      })();
      return result;
    })();
  }
  return encoded;
};
SolidityCoder.prototype.decodeParam = function(type, bytes) {
  return this.decodeParams([type], bytes)[0];
};
SolidityCoder.prototype.decodeParams = function(types, bytes) {
  var solidityTypes = this.getSolidityTypes(types);
  var offsets = this.getOffsets(types, solidityTypes);
  return solidityTypes.map(function(solidityType, index) {
    return solidityType.decode(bytes, offsets[index], types[index], index);
  });
};
SolidityCoder.prototype.getOffsets = function(types, solidityTypes) {
  var lengths = solidityTypes.map(function(solidityType, index) {
    return solidityType.staticPartLength(types[index]);
  });
  for (var i = 1; i < lengths.length; i++) {
    lengths[i] += lengths[i - 1];
  }
  return lengths.map(function(length, index) {
    var staticPartLength = solidityTypes[index].staticPartLength(types[index]);
    return length - staticPartLength;
  });
};
SolidityCoder.prototype.getSolidityTypes = function(types) {
  var self = this;
  return types.map(function(type) {
    return self._requireType(type);
  });
};
var coder = new SolidityCoder([new SolidityTypeAddress(), new SolidityTypeBool(), new SolidityTypeInt(), new SolidityTypeUInt(), new SolidityTypeDynamicBytes(), new SolidityTypeBytes(), new SolidityTypeString(), new SolidityTypeReal(), new SolidityTypeUReal()]);
module.exports = coder;
