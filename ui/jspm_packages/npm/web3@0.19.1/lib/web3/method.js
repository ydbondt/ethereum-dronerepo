/* */ 
var utils = require('../utils/utils');
var errors = require('./errors');
var Method = function(options) {
  this.name = options.name;
  this.call = options.call;
  this.params = options.params || 0;
  this.inputFormatter = options.inputFormatter;
  this.outputFormatter = options.outputFormatter;
  this.requestManager = null;
};
Method.prototype.setRequestManager = function(rm) {
  this.requestManager = rm;
};
Method.prototype.getCall = function(args) {
  return utils.isFunction(this.call) ? this.call(args) : this.call;
};
Method.prototype.extractCallback = function(args) {
  if (utils.isFunction(args[args.length - 1])) {
    return args.pop();
  }
};
Method.prototype.validateArgs = function(args) {
  if (args.length !== this.params) {
    throw errors.InvalidNumberOfRPCParams();
  }
};
Method.prototype.formatInput = function(args) {
  if (!this.inputFormatter) {
    return args;
  }
  return this.inputFormatter.map(function(formatter, index) {
    return formatter ? formatter(args[index]) : args[index];
  });
};
Method.prototype.formatOutput = function(result) {
  return this.outputFormatter && result ? this.outputFormatter(result) : result;
};
Method.prototype.toPayload = function(args) {
  var call = this.getCall(args);
  var callback = this.extractCallback(args);
  var params = this.formatInput(args);
  this.validateArgs(params);
  return {
    method: call,
    params: params,
    callback: callback
  };
};
Method.prototype.attachToObject = function(obj) {
  var func = this.buildCall();
  func.call = this.call;
  var name = this.name.split('.');
  if (name.length > 1) {
    obj[name[0]] = obj[name[0]] || {};
    obj[name[0]][name[1]] = func;
  } else {
    obj[name[0]] = func;
  }
};
Method.prototype.buildCall = function() {
  var method = this;
  var send = function() {
    var payload = method.toPayload(Array.prototype.slice.call(arguments));
    if (payload.callback) {
      return method.requestManager.sendAsync(payload, function(err, result) {
        payload.callback(err, method.formatOutput(result));
      });
    }
    return method.formatOutput(method.requestManager.send(payload));
  };
  send.request = this.request.bind(this);
  return send;
};
Method.prototype.request = function() {
  var payload = this.toPayload(Array.prototype.slice.call(arguments));
  payload.format = this.formatOutput.bind(this);
  return payload;
};
module.exports = Method;
