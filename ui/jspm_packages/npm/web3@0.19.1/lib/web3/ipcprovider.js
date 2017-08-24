/* */ 
"use strict";
var utils = require('../utils/utils');
var errors = require('./errors');
var IpcProvider = function(path, net) {
  var _this = this;
  this.responseCallbacks = {};
  this.path = path;
  this.connection = net.connect({path: this.path});
  this.connection.on('error', function(e) {
    console.error('IPC Connection Error', e);
    _this._timeout();
  });
  this.connection.on('end', function() {
    _this._timeout();
  });
  this.connection.on('data', function(data) {
    _this._parseResponse(data.toString()).forEach(function(result) {
      var id = null;
      if (utils.isArray(result)) {
        result.forEach(function(load) {
          if (_this.responseCallbacks[load.id])
            id = load.id;
        });
      } else {
        id = result.id;
      }
      if (_this.responseCallbacks[id]) {
        _this.responseCallbacks[id](null, result);
        delete _this.responseCallbacks[id];
      }
    });
  });
};
IpcProvider.prototype._parseResponse = function(data) {
  var _this = this,
      returnValues = [];
  var dechunkedData = data.replace(/\}[\n\r]?\{/g, '}|--|{').replace(/\}\][\n\r]?\[\{/g, '}]|--|[{').replace(/\}[\n\r]?\[\{/g, '}|--|[{').replace(/\}\][\n\r]?\{/g, '}]|--|{').split('|--|');
  dechunkedData.forEach(function(data) {
    if (_this.lastChunk)
      data = _this.lastChunk + data;
    var result = null;
    try {
      result = JSON.parse(data);
    } catch (e) {
      _this.lastChunk = data;
      clearTimeout(_this.lastChunkTimeout);
      _this.lastChunkTimeout = setTimeout(function() {
        _this._timeout();
        throw errors.InvalidResponse(data);
      }, 1000 * 15);
      return;
    }
    clearTimeout(_this.lastChunkTimeout);
    _this.lastChunk = null;
    if (result)
      returnValues.push(result);
  });
  return returnValues;
};
IpcProvider.prototype._addResponseCallback = function(payload, callback) {
  var id = payload.id || payload[0].id;
  var method = payload.method || payload[0].method;
  this.responseCallbacks[id] = callback;
  this.responseCallbacks[id].method = method;
};
IpcProvider.prototype._timeout = function() {
  for (var key in this.responseCallbacks) {
    if (this.responseCallbacks.hasOwnProperty(key)) {
      this.responseCallbacks[key](errors.InvalidConnection('on IPC'));
      delete this.responseCallbacks[key];
    }
  }
};
IpcProvider.prototype.isConnected = function() {
  var _this = this;
  if (!_this.connection.writable)
    _this.connection.connect({path: _this.path});
  return !!this.connection.writable;
};
IpcProvider.prototype.send = function(payload) {
  if (this.connection.writeSync) {
    var result;
    if (!this.connection.writable)
      this.connection.connect({path: this.path});
    var data = this.connection.writeSync(JSON.stringify(payload));
    try {
      result = JSON.parse(data);
    } catch (e) {
      throw errors.InvalidResponse(data);
    }
    return result;
  } else {
    throw new Error('You tried to send "' + payload.method + '" synchronously. Synchronous requests are not supported by the IPC provider.');
  }
};
IpcProvider.prototype.sendAsync = function(payload, callback) {
  if (!this.connection.writable)
    this.connection.connect({path: this.path});
  this.connection.write(JSON.stringify(payload));
  this._addResponseCallback(payload, callback);
};
module.exports = IpcProvider;
