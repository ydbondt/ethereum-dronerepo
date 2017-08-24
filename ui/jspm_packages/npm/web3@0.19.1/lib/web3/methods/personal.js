/* */ 
"use strict";
var Method = require('../method');
var Property = require('../property');
var formatters = require('../formatters');
function Personal(web3) {
  this._requestManager = web3._requestManager;
  var self = this;
  methods().forEach(function(method) {
    method.attachToObject(self);
    method.setRequestManager(self._requestManager);
  });
  properties().forEach(function(p) {
    p.attachToObject(self);
    p.setRequestManager(self._requestManager);
  });
}
var methods = function() {
  var newAccount = new Method({
    name: 'newAccount',
    call: 'personal_newAccount',
    params: 1,
    inputFormatter: [null]
  });
  var importRawKey = new Method({
    name: 'importRawKey',
    call: 'personal_importRawKey',
    params: 2
  });
  var sign = new Method({
    name: 'sign',
    call: 'personal_sign',
    params: 3,
    inputFormatter: [null, formatters.inputAddressFormatter, null]
  });
  var ecRecover = new Method({
    name: 'ecRecover',
    call: 'personal_ecRecover',
    params: 2
  });
  var unlockAccount = new Method({
    name: 'unlockAccount',
    call: 'personal_unlockAccount',
    params: 3,
    inputFormatter: [formatters.inputAddressFormatter, null, null]
  });
  var sendTransaction = new Method({
    name: 'sendTransaction',
    call: 'personal_sendTransaction',
    params: 2,
    inputFormatter: [formatters.inputTransactionFormatter, null]
  });
  var lockAccount = new Method({
    name: 'lockAccount',
    call: 'personal_lockAccount',
    params: 1,
    inputFormatter: [formatters.inputAddressFormatter]
  });
  return [newAccount, importRawKey, unlockAccount, ecRecover, sign, sendTransaction, lockAccount];
};
var properties = function() {
  return [new Property({
    name: 'listAccounts',
    getter: 'personal_listAccounts'
  })];
};
module.exports = Personal;
