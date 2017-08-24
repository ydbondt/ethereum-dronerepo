pragma solidity ^0.4.4;

contract Dronestore {

    struct Drone {
        bytes32 name;
        bytes32 serialnumber;
    }

    mapping(address => Drone[]) public drones;

    function addDrone(bytes32 _name, bytes32 _serialnumber) {
        Drone memory d;
        d.name = _name;
        d.serialnumber = _serialnumber;

        drones[msg.sender].push(d);
    }

    function getDrones() public constant returns (bytes32[], bytes32[]) {

        uint droneLen = drones[msg.sender].length;
        bytes32[] memory names = new bytes32[](droneLen);
        bytes32[] memory serialnumbers = new bytes32[](droneLen);
        for (uint i=0;i<droneLen;i++) {
            names[i] = drones[msg.sender][i].name;
            serialnumbers[i] = drones[msg.sender][i].serialnumber;
        }

        return (names, serialnumbers);
    }

    
}