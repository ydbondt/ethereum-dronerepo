/* */ 
var coder = require('../solidity/coder');
var utils = require('../utils/utils');
var errors = require('./errors');
var formatters = require('./formatters');
var sha3 = require('../utils/sha3');
var SolidityFunction = function(eth, json, address) {
  this._eth = eth;
  this._inputTypes = json.inputs.map(function(i) {
    return i.type;
  });
  this._outputTypes = json.outputs.map(function(i) {
    return i.type;
  });
  this._constant = json.constant;
  this._payable = json.payable;
  this._name = utils.transformToFullName(json);
  this._address = address;
};
SolidityFunction.prototype.extractCallback = function(args) {
  if (utils.isFunction(args[args.length - 1])) {
    return args.pop();
  }
};
SolidityFunction.prototype.extractDefaultBlock = function(args) {
  if (args.length > this._inputTypes.length && !utils.isObject(args[args.length - 1])) {
    return formatters.inputDefaultBlockNumberFormatter(args.pop());
  }
};
SolidityFunction.prototype.validateArgs = function(args) {
  var inputArgs = args.filter(function(a) {
    return !(utils.isObject(a) === true && utils.isArray(a) === false);
  });
  if (inputArgs.length !== this._inputTypes.length) {
    throw errors.InvalidNumberOfSolidityArgs();
  }
};
SolidityFunction.prototype.toPayload = function(args) {
  var options = {};
  if (args.length > this._inputTypes.length && utils.isObject(args[args.length - 1])) {
    options = args[args.length - 1];
  }
  this.validateArgs(args);
  options.to = this._address;
  options.data = '0x' + this.signature() + coder.encodeParams(this._inputTypes, args);
  return options;
};
SolidityFunction.prototype.signature = function() {
  return sha3(this._name).slice(0, 8);
};
SolidityFunction.prototype.unpackOutput = function(output) {
  if (!output) {
    return;
  }
  output = output.length >= 2 ? output.slice(2) : output;
  var result = coder.decodeParams(this._outputTypes, output);
  return result.length === 1 ? result[0] : result;
};
SolidityFunction.prototype.call = function() {
  var args = Array.prototype.slice.call(arguments).filter(function(a) {
    return a !== undefined;
  });
  var callback = this.extractCallback(args);
  var defaultBlock = this.extractDefaultBlock(args);
  var payload = this.toPayload(args);
  if (!callback) {
    var output = this._eth.call(payload, defaultBlock);
    return this.unpackOutput(output);
  }
  var self = this;
  this._eth.call(payload, defaultBlock, function(error, output) {
    if (error)
      return callback(error, null);
    var unpacked = null;
    try {
      unpacked = self.unpackOutput(output);
    } catch (e) {
      error = e;
    }
    callback(error, unpacked);
  });
};
SolidityFunction.prototype.sendTransaction = function() {
  var args = Array.prototype.slice.call(arguments).filter(function(a) {
    return a !== undefined;
  });
  var callback = this.extractCallback(args);
  var payload = this.toPayload(args);
  if (payload.value > 0 && !this._payable) {
    throw new Error('Cannot send value to non-payable function');
  }
  if (!callback) {
    return this._eth.sendTransaction(payload);
  }
  this._eth.sendTransaction(payload, callback);
};
SolidityFunction.prototype.estimateGas = function() {
  var args = Array.prototype.slice.call(arguments);
  var callback = this.extractCallback(args);
  var payload = this.toPayload(args);
  if (!callback) {
    return this._eth.estimateGas(payload);
  }
  this._eth.estimateGas(payload, callback);
};
SolidityFunction.prototype.getData = function() {
  var args = Array.prototype.slice.call(arguments);
  var payload = this.toPayload(args);
  return payload.data;
};
SolidityFunction.prototype.displayName = function() {
  return utils.extractDisplayName(this._name);
};
SolidityFunction.prototype.typeName = function() {
  return utils.extractTypeName(this._name);
};
SolidityFunction.prototype.request = function() {
  var args = Array.prototype.slice.call(arguments);
  var callback = this.extractCallback(args);
  var payload = this.toPayload(args);
  var format = this.unpackOutput.bind(this);
  return {
    method: this._constant ? 'eth_call' : 'eth_sendTransaction',
    callback: callback,
    params: [payload],
    format: format
  };
};
SolidityFunction.prototype.execute = function() {
  var transaction = !this._constant;
  if (transaction) {
    return this.sendTransaction.apply(this, Array.prototype.slice.call(arguments));
  }
  return this.call.apply(this, Array.prototype.slice.call(arguments));
};
SolidityFunction.prototype.attachToContract = function(contract) {
  var execute = this.execute.bind(this);
  execute.request = this.request.bind(this);
  execute.call = this.call.bind(this);
  execute.sendTransaction = this.sendTransaction.bind(this);
  execute.estimateGas = this.estimateGas.bind(this);
  execute.getData = this.getData.bind(this);
  var displayName = this.displayName();
  if (!contract[displayName]) {
    contract[displayName] = execute;
  }
  contract[displayName][this.typeName()] = execute;
};
module.exports = SolidityFunction;
