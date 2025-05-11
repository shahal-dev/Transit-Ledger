// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Station
 * @dev Stores station information for the TransitLedger platform
 */
contract Station is Ownable {
    struct StationData {
        uint256 id;
        string name;
        string city;
        string stationCode;
        int256 latitude;  // Stored as integer with 6 decimal places (e.g., 23.456789 becomes 23456789)
        int256 longitude; // Stored as integer with 6 decimal places (e.g., 90.123456 becomes 90123456)
        uint8 platformCount;
        bool operational;
    }

    // Mapping from stationId to station data
    mapping(uint256 => StationData) public stations;
    uint256 public stationCount;

    // Events
    event StationCreated(uint256 indexed stationId, string name, string stationCode);
    event StationUpdated(uint256 indexed stationId, string name, bool operational);

    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Add a new station to the system
     * @param name The name of the station
     * @param city The city where the station is located
     * @param stationCode The unique station code
     * @param latitude The latitude coordinate (multiplied by 10^6)
     * @param longitude The longitude coordinate (multiplied by 10^6)
     * @param platformCount The number of platforms at the station
     * @return stationId The ID of the new station
     */
    function addStation(
        string memory name,
        string memory city,
        string memory stationCode,
        int256 latitude,
        int256 longitude,
        uint8 platformCount
    ) public onlyOwner returns (uint256) {
        stationCount++;
        uint256 stationId = stationCount;
        
        stations[stationId] = StationData({
            id: stationId,
            name: name,
            city: city,
            stationCode: stationCode,
            latitude: latitude,
            longitude: longitude,
            platformCount: platformCount,
            operational: true
        });
        
        emit StationCreated(stationId, name, stationCode);
        return stationId;
    }

    /**
     * @dev Update station information
     * @param stationId The ID of the station to update
     * @param name The new name of the station
     * @param platformCount The new number of platforms
     * @param operational Whether the station is operational
     */
    function updateStation(
        uint256 stationId,
        string memory name,
        uint8 platformCount,
        bool operational
    ) public onlyOwner {
        require(stationId > 0 && stationId <= stationCount, "Station does not exist");
        
        StationData storage station = stations[stationId];
        
        station.name = name;
        station.platformCount = platformCount;
        station.operational = operational;
        
        emit StationUpdated(stationId, name, operational);
    }
    
    /**
     * @dev Get station information
     * @param stationId The ID of the station
     * @return Station data
     */
    function getStation(uint256 stationId) public view returns (StationData memory) {
        require(stationId > 0 && stationId <= stationCount, "Station does not exist");
        return stations[stationId];
    }
    
    /**
     * @dev Get all stations
     * @return Array of station IDs
     */
    function getAllStations() public view returns (uint256[] memory) {
        uint256[] memory stationIds = new uint256[](stationCount);
        
        for (uint256 i = 1; i <= stationCount; i++) {
            stationIds[i - 1] = i;
        }
        
        return stationIds;
    }
    
    /**
     * @dev Check if a station exists
     * @param stationId The station ID to check
     * @return Whether the station exists
     */
    function stationExists(uint256 stationId) public view returns (bool) {
        return stationId > 0 && stationId <= stationCount;
    }
    
    /**
     * @dev Get station by code
     * @param stationCode The unique station code
     * @return stationId The ID of the station with the given code
     */
    function getStationByCode(string memory stationCode) public view returns (uint256) {
        for (uint256 i = 1; i <= stationCount; i++) {
            if (keccak256(bytes(stations[i].stationCode)) == keccak256(bytes(stationCode))) {
                return i;
            }
        }
        revert("Station code not found");
    }
} 