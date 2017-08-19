var ConvertLib = artifacts.require("./ConvertLib.sol");
var Dronestore = artifacts.require("./Dronestore.sol");

module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, Dronestore);
  deployer.deploy(Dronestore);
};
