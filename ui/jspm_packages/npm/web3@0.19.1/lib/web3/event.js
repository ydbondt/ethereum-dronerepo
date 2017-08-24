/* */ 
var utils = require('../utils/utils');
var coder = require('../solidity/coder');
var formatters = require('./formatters');
var sha3 = require('../utils/sha3');
var Filter = require('./filter');
var watches = require('./methods/watches');
var SolidityEvent = function(requestManager, json, address) {
  this._requestManager = requestManager;
  this._params = json.inputs;
  this._name = utils.transformToFullName(json);
  this._address = address;
  this._anonymous = json.anonymous;
};
SolidityEvent.prototype.types = function(indexed) {
  return this._params.filter(function(i) {
    return i.indexed === indexed;
  }).map(function(i) {
    return i.type;
  });
};
SolidityEvent.prototype.displayName = function() {
  return utils.extractDisplayName(this._name);
};
SolidityEvent.prototype.typeName = function() {
  return utils.extractTypeName(this._name);
};
SolidityEvent.prototype.signature = function() {
  return sha3(this._name);
};
SolidityEvent.prototype.encode = function(indexed, options) {
  indexed = indexed || {};
  options = options || {};
  var result = {};
  ['fromBlock', 'toBlock'].filter(function(f) {
    return options[f] !== undefined;
  }).forEach(function(f) {
    result[f] = formatters.inputBlockNumberFormatter(options[f]);
  });
  result.topics = [];
  result.address = this._address;
  if (!this._anonymous) {
    result.topics.push('0x' + this.signature());
  }
  var indexedTopics = this._params.filter(function(i) {
    return i.indexed === true;
  }).map(function(i) {
    var value = indexed[i.name];
    if (value === undefined || value === null) {
      return null;
    }
    if (utils.isArray(value)) {
      return value.map(function(v) {
        return '0x' + coder.encodeParam(i.type, v);
      });
    }
    return '0x' + coder.encodeParam(i.type, value);
  });
  result.topics = result.topics.concat(indexedTopics);
  return result;
};
SolidityEvent.prototype.decode = function(data) {
  data.data = data.data || '';
  data.topics = data.topics || [];
  var argTopics = this._anonymous ? data.topics : data.topics.slice(1);
  var indexedData = argTopics.map(function(topics) {
    return topics.slice(2);
  }).join("");
  var indexedParams = coder.decodeParams(this.types(true), indexedData);
  var notIndexedData = data.data.slice(2);
  var notIndexedParams = coder.decodeParams(this.types(false), notIndexedData);
  var result = formatters.outputLogFormatter(data);
  result.event = this.displayName();
  result.address = data.address;
  result.args = this._params.reduce(function(acc, current) {
    acc[current.name] = current.indexed ? indexedParams.shift() : notIndexedParams.shift();
    return acc;
  }, {});
  delete result.data;
  delete result.topics;
  return result;
};
SolidityEvent.prototype.execute = function(indexed, options, callback) {
  if (utils.isFunction(arguments[arguments.length - 1])) {
    callback = arguments[arguments.length - 1];
    if (arguments.length === 2)
      options = null;
    if (arguments.length === 1) {
      options = null;
      indexed = {};
    }
  }
  var o = this.encode(indexed, options);
  var formatter = this.decode.bind(this);
  return new Filter(this._requestManager, o, watches.eth(), formatter, callback);
};
SolidityEvent.prototype.attachToContract = function(contract) {
  var execute = this.execute.bind(this);
  var displayName = this.displayName();
  if (!contract[displayName]) {
    contract[displayName] = execute;
  }
  contract[displayName][this.typeName()] = this.execute.bind(this, contract);
};
module.exports = SolidityEvent;
