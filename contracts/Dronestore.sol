pragma solidity ^0.4.4;

contract Dronestore {

    struct Drone {
        bytes32 name;
        bytes32 serialnumber;
    }

    Drone[] public drones;

    function addDrone(bytes32 _name, bytes32 _serialnumber) {
        Drone memory d;
        d.name = _name;
        d.serialnumber = _serialnumber;

        drones.push(d);
    }

    function getDrones() public constant returns (bytes32[], bytes32[]) {

        uint droneLen = drones.length;
        bytes32[] memory names = new bytes32[](droneLen);
        bytes32[] memory serialnumbers = new bytes32[](droneLen);
        for (uint i=0;i<drones.length;i++) {
            names[i] = drones[i].name;
            serialnumbers[i] = drones[i].serialnumber;
        }

        return (names, serialnumbers);
    }

    
}