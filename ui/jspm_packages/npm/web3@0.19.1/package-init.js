/* */ 
if (typeof window !== 'undefined') {
  Web3 = (typeof window.Web3 !== 'undefined') ? window.Web3 : require('./index');
  BigNumber = (typeof window.BigNumber !== 'undefined') ? window.BigNumber : require('bignumber.js');
}
if (typeof global !== 'undefined') {
  Web3 = (typeof global.Web3 !== 'undefined') ? global.Web3 : require('./index');
  BigNumber = (typeof global.BigNumber !== 'undefined') ? global.BigNumber : require('bignumber.js');
}
