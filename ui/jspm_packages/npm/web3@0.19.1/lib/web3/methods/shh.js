/* */ 
var Method = require('../method');
var formatters = require('../formatters');
var Filter = require('../filter');
var watches = require('./watches');
var Shh = function(web3) {
  this._requestManager = web3._requestManager;
  var self = this;
  methods().forEach(function(method) {
    method.attachToObject(self);
    method.setRequestManager(self._requestManager);
  });
};
Shh.prototype.filter = function(fil, callback) {
  return new Filter(this._requestManager, fil, watches.shh(), formatters.outputPostFormatter, callback);
};
var methods = function() {
  var post = new Method({
    name: 'post',
    call: 'shh_post',
    params: 1,
    inputFormatter: [formatters.inputPostFormatter]
  });
  var newIdentity = new Method({
    name: 'newIdentity',
    call: 'shh_newIdentity',
    params: 0
  });
  var hasIdentity = new Method({
    name: 'hasIdentity',
    call: 'shh_hasIdentity',
    params: 1
  });
  var newGroup = new Method({
    name: 'newGroup',
    call: 'shh_newGroup',
    params: 0
  });
  var addToGroup = new Method({
    name: 'addToGroup',
    call: 'shh_addToGroup',
    params: 0
  });
  return [post, newIdentity, hasIdentity, newGroup, addToGroup];
};
module.exports = Shh;
