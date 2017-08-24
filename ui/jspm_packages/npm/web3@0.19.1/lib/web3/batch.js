/* */ 
var Jsonrpc = require('./jsonrpc');
var errors = require('./errors');
var Batch = function(web3) {
  this.requestManager = web3._requestManager;
  this.requests = [];
};
Batch.prototype.add = function(request) {
  this.requests.push(request);
};
Batch.prototype.execute = function() {
  var requests = this.requests;
  this.requestManager.sendBatch(requests, function(err, results) {
    results = results || [];
    requests.map(function(request, index) {
      return results[index] || {};
    }).forEach(function(result, index) {
      if (requests[index].callback) {
        if (!Jsonrpc.isValidResponse(result)) {
          return requests[index].callback(errors.InvalidResponse(result));
        }
        requests[index].callback(null, (requests[index].format ? requests[index].format(result.result) : result.result));
      }
    });
  });
};
module.exports = Batch;
