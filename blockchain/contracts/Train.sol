// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Train
 * @dev Stores train metadata for the TransitLedger platform
 */
contract Train is Ownable {
    struct TrainData {
        uint256 id;
        string name;
        string trainNumber;
        uint8 coachCount;
        uint16 seatsPerCoach;
        bool operational;
    }

    // Mapping from trainId to train data
    mapping(uint256 => TrainData) public trains;
    uint256 public trainCount;

    // Events
    event TrainCreated(uint256 indexed trainId, string trainNumber, string name);
    event TrainUpdated(uint256 indexed trainId, string name, bool operational);

    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Add a new train to the system
     * @param name The name of the train
     * @param trainNumber The official train number
     * @param coachCount The number of coaches
     * @param seatsPerCoach The number of seats per coach
     * @return trainId The ID of the new train
     */
    function addTrain(
        string memory name,
        string memory trainNumber,
        uint8 coachCount,
        uint16 seatsPerCoach
    ) public onlyOwner returns (uint256) {
        trainCount++;
        uint256 trainId = trainCount;
        
        trains[trainId] = TrainData({
            id: trainId,
            name: name,
            trainNumber: trainNumber,
            coachCount: coachCount,
            seatsPerCoach: seatsPerCoach,
            operational: true
        });
        
        emit TrainCreated(trainId, trainNumber, name);
        return trainId;
    }

    /**
     * @dev Update train information
     * @param trainId The ID of the train to update
     * @param name The new name of the train
     * @param coachCount The new number of coaches
     * @param operational Whether the train is operational
     */
    function updateTrain(
        uint256 trainId,
        string memory name,
        uint8 coachCount,
        bool operational
    ) public onlyOwner {
        require(trainId > 0 && trainId <= trainCount, "Train does not exist");
        
        TrainData storage train = trains[trainId];
        
        train.name = name;
        train.coachCount = coachCount;
        train.operational = operational;
        
        emit TrainUpdated(trainId, name, operational);
    }
    
    /**
     * @dev Get train information
     * @param trainId The ID of the train
     * @return Train data
     */
    function getTrain(uint256 trainId) public view returns (TrainData memory) {
        require(trainId > 0 && trainId <= trainCount, "Train does not exist");
        return trains[trainId];
    }
    
    /**
     * @dev Get all trains
     * @return Array of train IDs
     */
    function getAllTrains() public view returns (uint256[] memory) {
        uint256[] memory trainIds = new uint256[](trainCount);
        
        for (uint256 i = 1; i <= trainCount; i++) {
            trainIds[i - 1] = i;
        }
        
        return trainIds;
    }
    
    /**
     * @dev Check if a train exists
     * @param trainId The train ID to check
     * @return Whether the train exists
     */
    function trainExists(uint256 trainId) public view returns (bool) {
        return trainId > 0 && trainId <= trainCount;
    }
} 