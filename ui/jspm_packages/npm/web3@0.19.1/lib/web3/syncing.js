/* */ 
(function(process) {
  var formatters = require('./formatters');
  var utils = require('../utils/utils');
  var count = 1;
  var pollSyncing = function(self) {
    var onMessage = function(error, sync) {
      if (error) {
        return self.callbacks.forEach(function(callback) {
          callback(error);
        });
      }
      if (utils.isObject(sync) && sync.startingBlock)
        sync = formatters.outputSyncingFormatter(sync);
      self.callbacks.forEach(function(callback) {
        if (self.lastSyncState !== sync) {
          if (!self.lastSyncState && utils.isObject(sync))
            callback(null, true);
          setTimeout(function() {
            callback(null, sync);
          }, 0);
          self.lastSyncState = sync;
        }
      });
    };
    self.requestManager.startPolling({
      method: 'eth_syncing',
      params: []
    }, self.pollId, onMessage, self.stopWatching.bind(self));
  };
  var IsSyncing = function(requestManager, callback) {
    this.requestManager = requestManager;
    this.pollId = 'syncPoll_' + count++;
    this.callbacks = [];
    this.addCallback(callback);
    this.lastSyncState = false;
    pollSyncing(this);
    return this;
  };
  IsSyncing.prototype.addCallback = function(callback) {
    if (callback)
      this.callbacks.push(callback);
    return this;
  };
  IsSyncing.prototype.stopWatching = function() {
    this.requestManager.stopPolling(this.pollId);
    this.callbacks = [];
  };
  module.exports = IsSyncing;
})(require('process'));
