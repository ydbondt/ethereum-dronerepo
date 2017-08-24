/* */ 
var Iban = require('./iban');
var exchangeAbi = require('../contracts/SmartExchange.json!systemjs-json');
var transfer = function(eth, from, to, value, callback) {
  var iban = new Iban(to);
  if (!iban.isValid()) {
    throw new Error('invalid iban address');
  }
  if (iban.isDirect()) {
    return transferToAddress(eth, from, iban.address(), value, callback);
  }
  if (!callback) {
    var address = eth.icapNamereg().addr(iban.institution());
    return deposit(eth, from, address, value, iban.client());
  }
  eth.icapNamereg().addr(iban.institution(), function(err, address) {
    return deposit(eth, from, address, value, iban.client(), callback);
  });
};
var transferToAddress = function(eth, from, to, value, callback) {
  return eth.sendTransaction({
    address: to,
    from: from,
    value: value
  }, callback);
};
var deposit = function(eth, from, to, value, client, callback) {
  var abi = exchangeAbi;
  return eth.contract(abi).at(to).deposit(client, {
    from: from,
    value: value
  }, callback);
};
module.exports = transfer;
