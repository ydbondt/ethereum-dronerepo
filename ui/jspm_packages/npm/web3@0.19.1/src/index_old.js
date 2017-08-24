/* */ 
var RequestManager = require('./web3/requestmanager');
var Iban = require('./web3/iban');
var Eth = require('./web3/methods/eth');
var DB = require('./web3/methods/db');
var Shh = require('./web3/methods/shh');
var Net = require('./web3/methods/net');
var Personal = require('./web3/methods/personal');
var Swarm = require('./web3/methods/swarm');
var Settings = require('./web3/settings');
var version = require('./version.json!systemjs-json');
var utils = require('./utils/utils');
var sha3 = require('./utils/sha3');
var extend = require('./web3/extend');
var Batch = require('./web3/batch');
var Property = require('./web3/property');
var HttpProvider = require('./web3/providers/httpprovider');
var IpcProvider = require('./web3/providers/ipcprovider');
var WebsocketProvider = require('./web3/providers/websocketprovider');
var BigNumber = require('bn.js');
function Web3(provider) {
  this._requestManager = new RequestManager(provider);
  this.currentProvider = provider;
  this.eth = new Eth(this);
  this.db = new DB(this);
  this.shh = new Shh(this);
  this.net = new Net(this);
  this.personal = new Personal(this);
  this.bzz = new Swarm(this);
  this.settings = new Settings();
  this.version = {api: version.version};
  this.providers = {
    HttpProvider: HttpProvider,
    IpcProvider: IpcProvider,
    WebsocketProvider: WebsocketProvider
  };
  this._extend = extend(this);
  this._extend({properties: properties()});
}
Web3.providers = {
  HttpProvider: HttpProvider,
  IpcProvider: IpcProvider,
  WebsocketProvider: WebsocketProvider
};
Web3.prototype.setProvider = function(provider) {
  this._requestManager.setProvider(provider);
  this.currentProvider = provider;
};
Web3.prototype.BigNumber = BigNumber;
Web3.prototype.toHex = utils.toHex;
Web3.prototype.toAscii = utils.toAscii;
Web3.prototype.toUtf8 = utils.toUtf8;
Web3.prototype.fromAscii = utils.fromAscii;
Web3.prototype.fromUtf8 = utils.fromUtf8;
Web3.prototype.toNumberString = utils.toNumberString;
Web3.prototype.fromNumber = utils.fromNumber;
Web3.prototype.toBigNumber = utils.toBigNumber;
Web3.prototype.toWei = utils.toWei;
Web3.prototype.fromWei = utils.fromWei;
Web3.prototype.isAddress = utils.isAddress;
Web3.prototype.checkAddressChecksum = utils.checkAddressChecksum;
Web3.prototype.toChecksumAddress = utils.toChecksumAddress;
Web3.prototype.isIBAN = utils.isIBAN;
Web3.prototype.sha3 = function(string, options) {
  return '0x' + sha3(string, options);
};
Web3.prototype.fromICAP = function(icap) {
  var iban = new Iban(icap);
  return iban.address();
};
var properties = function() {
  return [new Property({
    name: 'version.node',
    getter: 'web3_clientVersion'
  }), new Property({
    name: 'version.network',
    getter: 'net_version',
    inputFormatter: utils.toNumberString
  }), new Property({
    name: 'version.ethereum',
    getter: 'eth_protocolVersion',
    inputFormatter: utils.toNumberString
  }), new Property({
    name: 'version.whisper',
    getter: 'shh_version',
    inputFormatter: utils.toNumberString
  })];
};
Web3.prototype.isConnected = function() {
  return (this.currentProvider && this.currentProvider.isConnected());
};
module.exports = Web3;