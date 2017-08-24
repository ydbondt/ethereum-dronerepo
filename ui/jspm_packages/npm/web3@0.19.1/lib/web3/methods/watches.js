/* */ 
var Method = require('../method');
var eth = function() {
  var newFilterCall = function(args) {
    var type = args[0];
    switch (type) {
      case 'latest':
        args.shift();
        this.params = 0;
        return 'eth_newBlockFilter';
      case 'pending':
        args.shift();
        this.params = 0;
        return 'eth_newPendingTransactionFilter';
      default:
        return 'eth_newFilter';
    }
  };
  var newFilter = new Method({
    name: 'newFilter',
    call: newFilterCall,
    params: 1
  });
  var uninstallFilter = new Method({
    name: 'uninstallFilter',
    call: 'eth_uninstallFilter',
    params: 1
  });
  var getLogs = new Method({
    name: 'getLogs',
    call: 'eth_getFilterLogs',
    params: 1
  });
  var poll = new Method({
    name: 'poll',
    call: 'eth_getFilterChanges',
    params: 1
  });
  return [newFilter, uninstallFilter, getLogs, poll];
};
var shh = function() {
  var newFilter = new Method({
    name: 'newFilter',
    call: 'shh_newFilter',
    params: 1
  });
  var uninstallFilter = new Method({
    name: 'uninstallFilter',
    call: 'shh_uninstallFilter',
    params: 1
  });
  var getLogs = new Method({
    name: 'getLogs',
    call: 'shh_getMessages',
    params: 1
  });
  var poll = new Method({
    name: 'poll',
    call: 'shh_getFilterChanges',
    params: 1
  });
  return [newFilter, uninstallFilter, getLogs, poll];
};
module.exports = {
  eth: eth,
  shh: shh
};
