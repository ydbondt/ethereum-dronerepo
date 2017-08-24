/* */ 
var errors = require('./errors');
if (typeof window !== 'undefined' && window.XMLHttpRequest) {
  XMLHttpRequest = window.XMLHttpRequest;
} else {
  XMLHttpRequest = require('../utils/browser-xhr').XMLHttpRequest;
}
var XHR2 = require('xhr2');
var HttpProvider = function(host, timeout) {
  this.host = host || 'http://localhost:8545';
  this.timeout = timeout || 0;
};
HttpProvider.prototype.prepareRequest = function(async) {
  var request;
  if (async) {
    request = new XHR2();
    request.timeout = this.timeout;
  } else {
    request = new XMLHttpRequest();
  }
  request.open('POST', this.host, async);
  request.setRequestHeader('Content-Type', 'application/json');
  return request;
};
HttpProvider.prototype.send = function(payload) {
  var request = this.prepareRequest(false);
  try {
    request.send(JSON.stringify(payload));
  } catch (error) {
    throw errors.InvalidConnection(this.host);
  }
  var result = request.responseText;
  try {
    result = JSON.parse(result);
  } catch (e) {
    throw errors.InvalidResponse(request.responseText);
  }
  return result;
};
HttpProvider.prototype.sendAsync = function(payload, callback) {
  var request = this.prepareRequest(true);
  request.onreadystatechange = function() {
    if (request.readyState === 4 && request.timeout !== 1) {
      var result = request.responseText;
      var error = null;
      try {
        result = JSON.parse(result);
      } catch (e) {
        error = errors.InvalidResponse(request.responseText);
      }
      callback(error, result);
    }
  };
  request.ontimeout = function() {
    callback(errors.ConnectionTimeout(this.timeout));
  };
  try {
    request.send(JSON.stringify(payload));
  } catch (error) {
    callback(errors.InvalidConnection(this.host));
  }
};
HttpProvider.prototype.isConnected = function() {
  try {
    this.send({
      id: 9999999999,
      jsonrpc: '2.0',
      method: 'net_listening',
      params: []
    });
    return true;
  } catch (e) {
    return false;
  }
};
module.exports = HttpProvider;
