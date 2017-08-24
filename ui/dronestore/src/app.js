
import Web3 from 'web3';

export class App {
  constructor() {
    this.message = 'Hello World!';
    console.log(Web3);
    /*var client = new Web3("http://localhost:8545");
    var dronestoreABI = [{"constant":true,"inputs":[],"name":"getDrones","outputs":[{"name":"","type":"bytes32[]"},{"name":"","type":"bytes32[]"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_serialnumber","type":"bytes32"}],"name":"addDrone","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"drones","outputs":[{"name":"name","type":"bytes32"},{"name":"serialnumber","type":"bytes32"}],"payable":false,"type":"function"}];
    var dronestoreAddr = "0xbecbdc6d0cbc16d9d8918a6cc1bb2a3ada4c0d1a";
    this.dronestore = client.eth.contract(dronestoreABI).at(dronestoreAddr);*/
  }

  attached() {
  
  }
}
