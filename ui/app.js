import Web3 from 'web3';

export class App {
  constructor() {
    this.message = 'Hello World!';

    //var client = new Web3("http://localhost:8545");
    this.client = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    var dronestoreABI = [{"constant":true,"inputs":[],"name":"getDrones","outputs":[{"name":"","type":"bytes32[]"},{"name":"","type":"bytes32[]"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_serialnumber","type":"bytes32"}],"name":"addDrone","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"drones","outputs":[{"name":"name","type":"bytes32"},{"name":"serialnumber","type":"bytes32"}],"payable":false,"type":"function"}];
    var dronestoreAddr = "0x2058965df063d5445fda04a72e493715f374ce3a";
    this.dronestore = this.client.eth.contract(dronestoreABI).at(dronestoreAddr);

    window.dronestore = this.dronestore;
    window.web3 = this.client;
  }

  loadDrones() {
    this.drones = this.dronestore.getDrones();
  }

  save() {
    this.dronestore.addDrone(this.name, this.serialnumber);
    delete this.name;
    delete this.serialnumber;
    this.loadDrones();
  }

  attached() {
    this.accounts = this.client.eth.accounts;
    this.loadDrones();
  }
}