/* */ 
var Web3 = require('./lib/web3');
if (typeof window !== 'undefined' && typeof window.Web3 === 'undefined') {
  window.Web3 = Web3;
}
module.exports = Web3;
