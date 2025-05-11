// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Train.sol";
import "./Station.sol";

/**
 * @title Schedule
 * @dev Maps trains to platforms at specific times for the TransitLedger platform
 */
contract Schedule is Ownable {
    struct ScheduleData {
        uint256 id;
        uint256 trainId;
        uint256 fromStationId;
        uint256 toStationId;
        uint8 platformNumber;
        uint256 departureTime; // Unix timestamp
        uint256 arrivalTime;   // Unix timestamp
        string journeyDate;    // YYYY-MM-DD format for easier querying
        uint256 availableSeats;
        string status;        // scheduled, cancelled, completed
    }

    // Contracts
    Train private trainContract;
    Station private stationContract;

    // Mapping from scheduleId to schedule data
    mapping(uint256 => ScheduleData) public schedules;
    uint256 public scheduleCount;
    
    // Mapping of dates to scheduleIds for faster lookups
    mapping(string => uint256[]) private schedulesByDate;

    // Events
    event ScheduleCreated(
        uint256 indexed scheduleId,
        uint256 indexed trainId,
        uint256 fromStationId,
        uint256 toStationId,
        uint256 departureTime
    );
    
    event ScheduleUpdated(
        uint256 indexed scheduleId, 
        string status, 
        uint256 availableSeats
    );

    /**
     * @dev Constructor
     * @param trainContractAddress Address of the Train contract
     * @param stationContractAddress Address of the Station contract
     */
    constructor(address trainContractAddress, address stationContractAddress) Ownable(msg.sender) {
        trainContract = Train(trainContractAddress);
        stationContract = Station(stationContractAddress);
    }

    /**
     * @dev Create a new schedule
     * @param trainId ID of the train
     * @param fromStationId ID of the departure station
     * @param toStationId ID of the arrival station
     * @param platformNumber Platform number at the departure station
     * @param departureTime Departure time as Unix timestamp
     * @param arrivalTime Arrival time as Unix timestamp
     * @param journeyDate Journey date in YYYY-MM-DD format
     * @param availableSeats Initial number of available seats
     * @return scheduleId ID of the created schedule
     */
    function createSchedule(
        uint256 trainId,
        uint256 fromStationId,
        uint256 toStationId,
        uint8 platformNumber,
        uint256 departureTime,
        uint256 arrivalTime,
        string memory journeyDate,
        uint256 availableSeats
    ) public onlyOwner returns (uint256) {
        // Validate that train and stations exist
        require(trainContract.trainExists(trainId), "Train does not exist");
        require(stationContract.stationExists(fromStationId), "From station does not exist");
        require(stationContract.stationExists(toStationId), "To station does not exist");
        require(fromStationId != toStationId, "From and to stations must be different");
        require(departureTime < arrivalTime, "Departure time must be before arrival time");
        
        scheduleCount++;
        uint256 scheduleId = scheduleCount;
        
        schedules[scheduleId] = ScheduleData({
            id: scheduleId,
            trainId: trainId,
            fromStationId: fromStationId,
            toStationId: toStationId,
            platformNumber: platformNumber,
            departureTime: departureTime,
            arrivalTime: arrivalTime,
            journeyDate: journeyDate,
            availableSeats: availableSeats,
            status: "scheduled"
        });
        
        // Add to the date mapping
        schedulesByDate[journeyDate].push(scheduleId);
        
        emit ScheduleCreated(
            scheduleId, 
            trainId, 
            fromStationId, 
            toStationId, 
            departureTime
        );
        
        return scheduleId;
    }

    /**
     * @dev Update schedule status
     * @param scheduleId ID of the schedule to update
     * @param status New status (scheduled, cancelled, completed)
     */
    function updateScheduleStatus(uint256 scheduleId, string memory status) public onlyOwner {
        require(scheduleId > 0 && scheduleId <= scheduleCount, "Schedule does not exist");
        
        ScheduleData storage schedule = schedules[scheduleId];
        schedule.status = status;
        
        emit ScheduleUpdated(scheduleId, status, schedule.availableSeats);
    }

    /**
     * @dev Update available seats
     * @param scheduleId ID of the schedule to update
     * @param seats New number of available seats
     */
    function updateAvailableSeats(uint256 scheduleId, uint256 seats) public onlyOwner {
        require(scheduleId > 0 && scheduleId <= scheduleCount, "Schedule does not exist");
        
        ScheduleData storage schedule = schedules[scheduleId];
        schedule.availableSeats = seats;
        
        emit ScheduleUpdated(scheduleId, schedule.status, seats);
    }
    
    /**
     * @dev Get schedule information
     * @param scheduleId ID of the schedule
     * @return Schedule data
     */
    function getSchedule(uint256 scheduleId) public view returns (ScheduleData memory) {
        require(scheduleId > 0 && scheduleId <= scheduleCount, "Schedule does not exist");
        return schedules[scheduleId];
    }
    
    /**
     * @dev Get all schedules for a specific date
     * @param journeyDate Date in YYYY-MM-DD format
     * @return Array of schedule IDs for the given date
     */
    function getSchedulesByDate(string memory journeyDate) public view returns (uint256[] memory) {
        return schedulesByDate[journeyDate];
    }
    
    /**
     * @dev Get all schedule IDs
     * @return Array of all schedule IDs
     */
    function getAllSchedules() public view returns (uint256[] memory) {
        uint256[] memory scheduleIds = new uint256[](scheduleCount);
        
        for (uint256 i = 1; i <= scheduleCount; i++) {
            scheduleIds[i - 1] = i;
        }
        
        return scheduleIds;
    }
    
    /**
     * @dev Get schedules by train
     * @param trainId ID of the train
     * @return Array of schedule IDs for the given train
     */
    function getSchedulesByTrain(uint256 trainId) public view returns (uint256[] memory) {
        // Count schedules first
        uint256 count = 0;
        for (uint256 i = 1; i <= scheduleCount; i++) {
            if (schedules[i].trainId == trainId) {
                count++;
            }
        }
        
        // Create result array
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= scheduleCount; i++) {
            if (schedules[i].trainId == trainId) {
                result[index] = i;
                index++;
            }
        }
        
        return result;
    }
} 