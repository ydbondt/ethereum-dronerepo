/* */ 
var globalRegistrarAbi = require('../contracts/GlobalRegistrar.json!systemjs-json');
var icapRegistrarAbi = require('../contracts/ICAPRegistrar.json!systemjs-json');
var globalNameregAddress = '0xc6d9d2cd449a754c494264e1809c50e34d64562b';
var icapNameregAddress = '0xa1a111bc074c9cfa781f0c38e63bd51c91b8af00';
module.exports = {
  global: {
    abi: globalRegistrarAbi,
    address: globalNameregAddress
  },
  icap: {
    abi: icapRegistrarAbi,
    address: icapNameregAddress
  }
};
