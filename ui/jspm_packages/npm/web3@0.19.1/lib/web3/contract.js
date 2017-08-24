/* */ 
var utils = require('../utils/utils');
var coder = require('../solidity/coder');
var SolidityEvent = require('./event');
var SolidityFunction = require('./function');
var AllEvents = require('./allevents');
var encodeConstructorParams = function(abi, params) {
  return abi.filter(function(json) {
    return json.type === 'constructor' && json.inputs.length === params.length;
  }).map(function(json) {
    return json.inputs.map(function(input) {
      return input.type;
    });
  }).map(function(types) {
    return coder.encodeParams(types, params);
  })[0] || '';
};
var addFunctionsToContract = function(contract) {
  contract.abi.filter(function(json) {
    return json.type === 'function';
  }).map(function(json) {
    return new SolidityFunction(contract._eth, json, contract.address);
  }).forEach(function(f) {
    f.attachToContract(contract);
  });
};
var addEventsToContract = function(contract) {
  var events = contract.abi.filter(function(json) {
    return json.type === 'event';
  });
  var All = new AllEvents(contract._eth._requestManager, events, contract.address);
  All.attachToContract(contract);
  events.map(function(json) {
    return new SolidityEvent(contract._eth._requestManager, json, contract.address);
  }).forEach(function(e) {
    e.attachToContract(contract);
  });
};
var checkForContractAddress = function(contract, callback) {
  var count = 0,
      callbackFired = false;
  var filter = contract._eth.filter('latest', function(e) {
    if (!e && !callbackFired) {
      count++;
      if (count > 50) {
        filter.stopWatching(function() {});
        callbackFired = true;
        if (callback)
          callback(new Error('Contract transaction couldn\'t be found after 50 blocks'));
        else
          throw new Error('Contract transaction couldn\'t be found after 50 blocks');
      } else {
        contract._eth.getTransactionReceipt(contract.transactionHash, function(e, receipt) {
          if (receipt && !callbackFired) {
            contract._eth.getCode(receipt.contractAddress, function(e, code) {
              if (callbackFired || !code)
                return;
              filter.stopWatching(function() {});
              callbackFired = true;
              if (code.length > 3) {
                contract.address = receipt.contractAddress;
                addFunctionsToContract(contract);
                addEventsToContract(contract);
                if (callback)
                  callback(null, contract);
              } else {
                if (callback)
                  callback(new Error('The contract code couldn\'t be stored, please check your gas amount.'));
                else
                  throw new Error('The contract code couldn\'t be stored, please check your gas amount.');
              }
            });
          }
        });
      }
    }
  });
};
var ContractFactory = function(eth, abi) {
  this.eth = eth;
  this.abi = abi;
  this.new = function() {
    var contract = new Contract(this.eth, this.abi);
    var options = {};
    var callback;
    var args = Array.prototype.slice.call(arguments);
    if (utils.isFunction(args[args.length - 1])) {
      callback = args.pop();
    }
    var last = args[args.length - 1];
    if (utils.isObject(last) && !utils.isArray(last)) {
      options = args.pop();
    }
    if (options.value > 0) {
      var constructorAbi = abi.filter(function(json) {
        return json.type === 'constructor' && json.inputs.length === args.length;
      })[0] || {};
      if (!constructorAbi.payable) {
        throw new Error('Cannot send value to non-payable constructor');
      }
    }
    var bytes = encodeConstructorParams(this.abi, args);
    options.data += bytes;
    if (callback) {
      this.eth.sendTransaction(options, function(err, hash) {
        if (err) {
          callback(err);
        } else {
          contract.transactionHash = hash;
          callback(null, contract);
          checkForContractAddress(contract, callback);
        }
      });
    } else {
      var hash = this.eth.sendTransaction(options);
      contract.transactionHash = hash;
      checkForContractAddress(contract);
    }
    return contract;
  };
  this.new.getData = this.getData.bind(this);
};
ContractFactory.prototype.at = function(address, callback) {
  var contract = new Contract(this.eth, this.abi, address);
  addFunctionsToContract(contract);
  addEventsToContract(contract);
  if (callback) {
    callback(null, contract);
  }
  return contract;
};
ContractFactory.prototype.getData = function() {
  var options = {};
  var args = Array.prototype.slice.call(arguments);
  var last = args[args.length - 1];
  if (utils.isObject(last) && !utils.isArray(last)) {
    options = args.pop();
  }
  var bytes = encodeConstructorParams(this.abi, args);
  options.data += bytes;
  return options.data;
};
var Contract = function(eth, abi, address) {
  this._eth = eth;
  this.transactionHash = null;
  this.address = address;
  this.abi = abi;
};
module.exports = ContractFactory;
