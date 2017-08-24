/* */ 
var utils = require('../utils/utils');
var config = require('../utils/config');
var Iban = require('./iban');
var outputBigNumberFormatter = function(number) {
  return utils.toBigNumber(number);
};
var isPredefinedBlockNumber = function(blockNumber) {
  return blockNumber === 'latest' || blockNumber === 'pending' || blockNumber === 'earliest';
};
var inputDefaultBlockNumberFormatter = function(blockNumber) {
  if (blockNumber === undefined) {
    return config.defaultBlock;
  }
  return inputBlockNumberFormatter(blockNumber);
};
var inputBlockNumberFormatter = function(blockNumber) {
  if (blockNumber === undefined) {
    return undefined;
  } else if (isPredefinedBlockNumber(blockNumber)) {
    return blockNumber;
  }
  return utils.toHex(blockNumber);
};
var inputCallFormatter = function(options) {
  options.from = options.from || config.defaultAccount;
  if (options.from) {
    options.from = inputAddressFormatter(options.from);
  }
  if (options.to) {
    options.to = inputAddressFormatter(options.to);
  }
  ['gasPrice', 'gas', 'value', 'nonce'].filter(function(key) {
    return options[key] !== undefined;
  }).forEach(function(key) {
    options[key] = utils.fromDecimal(options[key]);
  });
  return options;
};
var inputTransactionFormatter = function(options) {
  options.from = options.from || config.defaultAccount;
  options.from = inputAddressFormatter(options.from);
  if (options.to) {
    options.to = inputAddressFormatter(options.to);
  }
  ['gasPrice', 'gas', 'value', 'nonce'].filter(function(key) {
    return options[key] !== undefined;
  }).forEach(function(key) {
    options[key] = utils.fromDecimal(options[key]);
  });
  return options;
};
var outputTransactionFormatter = function(tx) {
  if (tx.blockNumber !== null)
    tx.blockNumber = utils.toDecimal(tx.blockNumber);
  if (tx.transactionIndex !== null)
    tx.transactionIndex = utils.toDecimal(tx.transactionIndex);
  tx.nonce = utils.toDecimal(tx.nonce);
  tx.gas = utils.toDecimal(tx.gas);
  tx.gasPrice = utils.toBigNumber(tx.gasPrice);
  tx.value = utils.toBigNumber(tx.value);
  return tx;
};
var outputTransactionReceiptFormatter = function(receipt) {
  if (receipt.blockNumber !== null)
    receipt.blockNumber = utils.toDecimal(receipt.blockNumber);
  if (receipt.transactionIndex !== null)
    receipt.transactionIndex = utils.toDecimal(receipt.transactionIndex);
  receipt.cumulativeGasUsed = utils.toDecimal(receipt.cumulativeGasUsed);
  receipt.gasUsed = utils.toDecimal(receipt.gasUsed);
  if (utils.isArray(receipt.logs)) {
    receipt.logs = receipt.logs.map(function(log) {
      return outputLogFormatter(log);
    });
  }
  return receipt;
};
var outputBlockFormatter = function(block) {
  block.gasLimit = utils.toDecimal(block.gasLimit);
  block.gasUsed = utils.toDecimal(block.gasUsed);
  block.size = utils.toDecimal(block.size);
  block.timestamp = utils.toDecimal(block.timestamp);
  if (block.number !== null)
    block.number = utils.toDecimal(block.number);
  block.difficulty = utils.toBigNumber(block.difficulty);
  block.totalDifficulty = utils.toBigNumber(block.totalDifficulty);
  if (utils.isArray(block.transactions)) {
    block.transactions.forEach(function(item) {
      if (!utils.isString(item))
        return outputTransactionFormatter(item);
    });
  }
  return block;
};
var outputLogFormatter = function(log) {
  if (log.blockNumber !== null)
    log.blockNumber = utils.toDecimal(log.blockNumber);
  if (log.transactionIndex !== null)
    log.transactionIndex = utils.toDecimal(log.transactionIndex);
  if (log.logIndex !== null)
    log.logIndex = utils.toDecimal(log.logIndex);
  return log;
};
var inputPostFormatter = function(post) {
  post.ttl = utils.fromDecimal(post.ttl);
  post.workToProve = utils.fromDecimal(post.workToProve);
  post.priority = utils.fromDecimal(post.priority);
  if (!utils.isArray(post.topics)) {
    post.topics = post.topics ? [post.topics] : [];
  }
  post.topics = post.topics.map(function(topic) {
    return (topic.indexOf('0x') === 0) ? topic : utils.fromUtf8(topic);
  });
  return post;
};
var outputPostFormatter = function(post) {
  post.expiry = utils.toDecimal(post.expiry);
  post.sent = utils.toDecimal(post.sent);
  post.ttl = utils.toDecimal(post.ttl);
  post.workProved = utils.toDecimal(post.workProved);
  if (!post.topics) {
    post.topics = [];
  }
  post.topics = post.topics.map(function(topic) {
    return utils.toAscii(topic);
  });
  return post;
};
var inputAddressFormatter = function(address) {
  var iban = new Iban(address);
  if (iban.isValid() && iban.isDirect()) {
    return '0x' + iban.address();
  } else if (utils.isStrictAddress(address)) {
    return address;
  } else if (utils.isAddress(address)) {
    return '0x' + address;
  }
  throw new Error('invalid address');
};
var outputSyncingFormatter = function(result) {
  result.startingBlock = utils.toDecimal(result.startingBlock);
  result.currentBlock = utils.toDecimal(result.currentBlock);
  result.highestBlock = utils.toDecimal(result.highestBlock);
  if (result.knownStates) {
    result.knownStates = utils.toDecimal(result.knownStates);
    result.pulledStates = utils.toDecimal(result.pulledStates);
  }
  return result;
};
module.exports = {
  inputDefaultBlockNumberFormatter: inputDefaultBlockNumberFormatter,
  inputBlockNumberFormatter: inputBlockNumberFormatter,
  inputCallFormatter: inputCallFormatter,
  inputTransactionFormatter: inputTransactionFormatter,
  inputAddressFormatter: inputAddressFormatter,
  inputPostFormatter: inputPostFormatter,
  outputBigNumberFormatter: outputBigNumberFormatter,
  outputTransactionFormatter: outputTransactionFormatter,
  outputTransactionReceiptFormatter: outputTransactionReceiptFormatter,
  outputBlockFormatter: outputBlockFormatter,
  outputLogFormatter: outputLogFormatter,
  outputPostFormatter: outputPostFormatter,
  outputSyncingFormatter: outputSyncingFormatter
};
