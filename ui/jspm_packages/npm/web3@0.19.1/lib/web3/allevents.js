/* */ 
var sha3 = require('../utils/sha3');
var SolidityEvent = require('./event');
var formatters = require('./formatters');
var utils = require('../utils/utils');
var Filter = require('./filter');
var watches = require('./methods/watches');
var AllSolidityEvents = function(requestManager, json, address) {
  this._requestManager = requestManager;
  this._json = json;
  this._address = address;
};
AllSolidityEvents.prototype.encode = function(options) {
  options = options || {};
  var result = {};
  ['fromBlock', 'toBlock'].filter(function(f) {
    return options[f] !== undefined;
  }).forEach(function(f) {
    result[f] = formatters.inputBlockNumberFormatter(options[f]);
  });
  result.address = this._address;
  return result;
};
AllSolidityEvents.prototype.decode = function(data) {
  data.data = data.data || '';
  data.topics = data.topics || [];
  var eventTopic = data.topics[0].slice(2);
  var match = this._json.filter(function(j) {
    return eventTopic === sha3(utils.transformToFullName(j));
  })[0];
  if (!match) {
    console.warn('cannot find event for log');
    return data;
  }
  var event = new SolidityEvent(this._requestManager, match, this._address);
  return event.decode(data);
};
AllSolidityEvents.prototype.execute = function(options, callback) {
  if (utils.isFunction(arguments[arguments.length - 1])) {
    callback = arguments[arguments.length - 1];
    if (arguments.length === 1)
      options = null;
  }
  var o = this.encode(options);
  var formatter = this.decode.bind(this);
  return new Filter(this._requestManager, o, watches.eth(), formatter, callback);
};
AllSolidityEvents.prototype.attachToContract = function(contract) {
  var execute = this.execute.bind(this);
  contract.allEvents = execute;
};
module.exports = AllSolidityEvents;
