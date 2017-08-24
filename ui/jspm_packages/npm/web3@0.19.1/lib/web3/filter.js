/* */ 
var formatters = require('./formatters');
var utils = require('../utils/utils');
var toTopic = function(value) {
  if (value === null || typeof value === 'undefined')
    return null;
  value = String(value);
  if (value.indexOf('0x') === 0)
    return value;
  else
    return utils.fromUtf8(value);
};
var getOptions = function(options) {
  if (utils.isString(options)) {
    return options;
  }
  options = options || {};
  options.topics = options.topics || [];
  options.topics = options.topics.map(function(topic) {
    return (utils.isArray(topic)) ? topic.map(toTopic) : toTopic(topic);
  });
  return {
    topics: options.topics,
    from: options.from,
    to: options.to,
    address: options.address,
    fromBlock: formatters.inputBlockNumberFormatter(options.fromBlock),
    toBlock: formatters.inputBlockNumberFormatter(options.toBlock)
  };
};
var getLogsAtStart = function(self, callback) {
  if (!utils.isString(self.options)) {
    self.get(function(err, messages) {
      if (err) {
        callback(err);
      }
      if (utils.isArray(messages)) {
        messages.forEach(function(message) {
          callback(null, message);
        });
      }
    });
  }
};
var pollFilter = function(self) {
  var onMessage = function(error, messages) {
    if (error) {
      return self.callbacks.forEach(function(callback) {
        callback(error);
      });
    }
    if (utils.isArray(messages)) {
      messages.forEach(function(message) {
        message = self.formatter ? self.formatter(message) : message;
        self.callbacks.forEach(function(callback) {
          callback(null, message);
        });
      });
    }
  };
  self.requestManager.startPolling({
    method: self.implementation.poll.call,
    params: [self.filterId]
  }, self.filterId, onMessage, self.stopWatching.bind(self));
};
var Filter = function(requestManager, options, methods, formatter, callback, filterCreationErrorCallback) {
  var self = this;
  var implementation = {};
  methods.forEach(function(method) {
    method.setRequestManager(requestManager);
    method.attachToObject(implementation);
  });
  this.requestManager = requestManager;
  this.options = getOptions(options);
  this.implementation = implementation;
  this.filterId = null;
  this.callbacks = [];
  this.getLogsCallbacks = [];
  this.pollFilters = [];
  this.formatter = formatter;
  this.implementation.newFilter(this.options, function(error, id) {
    if (error) {
      self.callbacks.forEach(function(cb) {
        cb(error);
      });
      if (typeof filterCreationErrorCallback === 'function') {
        filterCreationErrorCallback(error);
      }
    } else {
      self.filterId = id;
      self.getLogsCallbacks.forEach(function(cb) {
        self.get(cb);
      });
      self.getLogsCallbacks = [];
      self.callbacks.forEach(function(cb) {
        getLogsAtStart(self, cb);
      });
      if (self.callbacks.length > 0)
        pollFilter(self);
      if (typeof callback === 'function') {
        return self.watch(callback);
      }
    }
  });
  return this;
};
Filter.prototype.watch = function(callback) {
  this.callbacks.push(callback);
  if (this.filterId) {
    getLogsAtStart(this, callback);
    pollFilter(this);
  }
  return this;
};
Filter.prototype.stopWatching = function(callback) {
  this.requestManager.stopPolling(this.filterId);
  this.callbacks = [];
  if (callback) {
    this.implementation.uninstallFilter(this.filterId, callback);
  } else {
    return this.implementation.uninstallFilter(this.filterId);
  }
};
Filter.prototype.get = function(callback) {
  var self = this;
  if (utils.isFunction(callback)) {
    if (this.filterId === null) {
      this.getLogsCallbacks.push(callback);
    } else {
      this.implementation.getLogs(this.filterId, function(err, res) {
        if (err) {
          callback(err);
        } else {
          callback(null, res.map(function(log) {
            return self.formatter ? self.formatter(log) : log;
          }));
        }
      });
    }
  } else {
    if (this.filterId === null) {
      throw new Error('Filter ID Error: filter().get() can\'t be chained synchronous, please provide a callback for the get() method.');
    }
    var logs = this.implementation.getLogs(this.filterId);
    return logs.map(function(log) {
      return self.formatter ? self.formatter(log) : log;
    });
  }
  return this;
};
module.exports = Filter;
