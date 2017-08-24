/* */ 
var utils = require('./utils');
var sha3 = require('./sha3');
function codePointToInt(codePoint) {
  if (codePoint >= 48 && codePoint <= 57) {
    return codePoint - 48;
  }
  if (codePoint >= 65 && codePoint <= 70) {
    return codePoint - 55;
  }
  if (codePoint >= 97 && codePoint <= 102) {
    return codePoint - 87;
  }
  throw "invalid bloom";
}
function testBytes(bloom, bytes) {
  var hash = sha3(bytes, {encoding: "hex"});
  for (var i = 0; i < 12; i += 4) {
    var bitpos = ((parseInt(hash.substr(i, 2), 16) << 8) + parseInt(hash.substr((i + 2), 2), 16)) & 2047;
    var code = codePointToInt(bloom.charCodeAt(bloom.length - 1 - Math.floor(bitpos / 4)));
    var offset = 1 << (bitpos % 4);
    if ((code & offset) !== offset) {
      return false;
    }
  }
  return true;
}
var testAddress = function(bloom, address) {
  if (!utils.isBloom(bloom))
    throw "invalid bloom";
  if (!utils.isAddress(address))
    throw "invalid address";
  return testBytes(bloom, address);
};
var testTopic = function(bloom, topic) {
  if (!utils.isBloom(bloom))
    throw "invalid bloom";
  if (!utils.isTopic(topic))
    throw "invalid topic";
  return testBytes(bloom, topic);
};
module.exports = {
  testAddress: testAddress,
  testTopic: testTopic
};
