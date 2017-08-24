/* */ 
var utils = require('../../utils/utils');
var Property = require('../property');
var Net = function(web3) {
  this._requestManager = web3._requestManager;
  var self = this;
  properties().forEach(function(p) {
    p.attachToObject(self);
    p.setRequestManager(web3._requestManager);
  });
};
var properties = function() {
  return [new Property({
    name: 'listening',
    getter: 'net_listening'
  }), new Property({
    name: 'peerCount',
    getter: 'net_peerCount',
    outputFormatter: utils.toDecimal
  })];
};
module.exports = Net;
