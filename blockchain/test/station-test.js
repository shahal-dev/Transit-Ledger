const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Station", function() {
  let station;
  let owner;
  let addr1;
  
  beforeEach(async function() {
    [owner, addr1] = await ethers.getSigners();
    
    const Station = await ethers.getContractFactory("Station");
    station = await Station.deploy();
  });
  
  describe("Station Management", function() {
    it("Should allow adding a new station", async function() {
      const stationName = "Central Station";
      const city = "New York";
      const stationCode = "NYK-CNT";
      const latitude = 407128; // 40.7128 with 6 decimal places
      const longitude = -740060; // -74.0060 with 6 decimal places
      const platformCount = 12;
      
      await station.addStation(stationName, city, stationCode, latitude, longitude, platformCount);
      
      const stationId = 1;
      const stationInfo = await station.getStation(stationId);
      expect(stationInfo.name).to.equal(stationName);
      expect(stationInfo.city).to.equal(city);
      expect(stationInfo.stationCode).to.equal(stationCode);
      expect(stationInfo.latitude).to.equal(latitude);
      expect(stationInfo.longitude).to.equal(longitude);
      expect(stationInfo.platformCount).to.equal(platformCount);
      expect(stationInfo.operational).to.equal(true);
    });
    
    it("Should allow updating station details", async function() {
      // First add a station
      await station.addStation(
        "Initial Station", 
        "Old City", 
        "OLD-01", 
        0, 
        0, 
        5
      );
      
      // Then update it
      const stationId = 1;
      const newName = "Updated Station";
      const newPlatformCount = 8;
      const operational = true;
      
      await station.updateStation(stationId, newName, newPlatformCount, operational);
      
      const stationInfo = await station.getStation(stationId);
      expect(stationInfo.name).to.equal(newName);
      expect(stationInfo.platformCount).to.equal(newPlatformCount);
      // These should remain unchanged
      expect(stationInfo.city).to.equal("Old City");
    });
    
    it("Should allow changing station operational status", async function() {
      // Add a station
      await station.addStation(
        "Test Station", 
        "Test City", 
        "TEST-01", 
        0, 
        0, 
        5
      );
      
      // Change operational status to false
      const stationId = 1;
      const operational = false;
      
      await station.updateStation(stationId, "Test Station", 5, operational);
      
      const stationInfo = await station.getStation(stationId);
      expect(stationInfo.operational).to.equal(operational);
    });
    
    it("Should fail when unauthorized user tries to add a station", async function() {
      await expect(
        station.connect(addr1).addStation(
          "Unauthorized Station", 
          "City", 
          "UNAUTH-01", 
          0, 
          0, 
          5
        )
      ).to.be.reverted;
    });
    
    it("Should allow getting all stations", async function() {
      // Add multiple stations
      await station.addStation(
        "Station 1", 
        "City 1", 
        "STA-01", 
        100000, 
        100000, 
        6
      );
      
      await station.addStation(
        "Station 2", 
        "City 2", 
        "STA-02", 
        200000, 
        200000, 
        8
      );
      
      const stationIds = await station.getAllStations();
      
      expect(stationIds.length).to.equal(2);
      
      // Get details of each station
      const station1 = await station.getStation(stationIds[0]);
      const station2 = await station.getStation(stationIds[1]);
      
      expect(station1.name).to.equal("Station 1");
      expect(station2.name).to.equal("Station 2");
    });
  });
}); 