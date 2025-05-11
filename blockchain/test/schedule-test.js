const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Schedule", function() {
  let train;
  let station;
  let schedule;
  let owner;
  let addr1;
  
  beforeEach(async function() {
    [owner, addr1] = await ethers.getSigners();
    
    // Deploy Train contract
    const Train = await ethers.getContractFactory("Train");
    train = await Train.deploy();
    
    // Deploy Station contract
    const Station = await ethers.getContractFactory("Station");
    station = await Station.deploy();
    
    // Deploy Schedule contract with Train and Station addresses
    const Schedule = await ethers.getContractFactory("Schedule");
    schedule = await Schedule.deploy(await train.getAddress(), await station.getAddress());
    
    // Add train and stations for testing
    await train.addTrain("Express 101", "E101", 10, 60);
    await station.addStation("Central Station", "New York", "NYC", 407128, -740060, 12);
    await station.addStation("Union Station", "Chicago", "CHI", 418781, -876298, 10);
  });
  
  describe("Schedule Management", function() {
    it("Should allow creating a new schedule", async function() {
      const scheduleId = 1;
      const trainId = 1;
      const fromStationId = 1;
      const toStationId = 2;
      const platformNumber = 3;
      const currentTime = Math.floor(Date.now() / 1000);
      const departureTime = currentTime + 3600; // 1 hour from now
      const arrivalTime = currentTime + 7200; // 2 hours from now
      const journeyDate = "2023-07-01";
      const availableSeats = 600; // 10 coaches * 60 seats
      
      await schedule.createSchedule(
        trainId, fromStationId, toStationId, platformNumber,
        departureTime, arrivalTime, journeyDate, availableSeats
      );
      
      const scheduleInfo = await schedule.getSchedule(scheduleId);
      expect(scheduleInfo.trainId).to.equal(trainId);
      expect(scheduleInfo.fromStationId).to.equal(fromStationId);
      expect(scheduleInfo.toStationId).to.equal(toStationId);
      expect(scheduleInfo.platformNumber).to.equal(platformNumber);
      expect(scheduleInfo.departureTime).to.equal(departureTime);
      expect(scheduleInfo.arrivalTime).to.equal(arrivalTime);
      expect(scheduleInfo.journeyDate).to.equal(journeyDate);
      expect(scheduleInfo.availableSeats).to.equal(availableSeats);
      expect(scheduleInfo.status).to.equal("scheduled");
    });
    
    it("Should allow updating schedule status", async function() {
      // First create a schedule
      const currentTime = Math.floor(Date.now() / 1000);
      const departureTime = currentTime + 3600;
      const arrivalTime = currentTime + 7200;
      
      await schedule.createSchedule(
        1, 1, 2, 3, departureTime, arrivalTime, "2023-07-01", 600
      );
      
      // Then update its status
      const scheduleId = 1;
      await schedule.updateScheduleStatus(scheduleId, "cancelled");
      
      const scheduleInfo = await schedule.getSchedule(scheduleId);
      expect(scheduleInfo.status).to.equal("cancelled");
    });
    
    it("Should allow updating available seats", async function() {
      // First create a schedule
      const currentTime = Math.floor(Date.now() / 1000);
      const departureTime = currentTime + 3600;
      const arrivalTime = currentTime + 7200;
      
      await schedule.createSchedule(
        1, 1, 2, 3, departureTime, arrivalTime, "2023-07-01", 600
      );
      
      // Then update available seats
      const scheduleId = 1;
      const newAvailableSeats = 550;
      
      await schedule.updateAvailableSeats(scheduleId, newAvailableSeats);
      
      const scheduleInfo = await schedule.getSchedule(scheduleId);
      expect(scheduleInfo.availableSeats).to.equal(newAvailableSeats);
    });
    
    it("Should allow getting schedules by date", async function() {
      // Add multiple schedules
      const currentTime = Math.floor(Date.now() / 1000);
      const departureTime1 = currentTime + 3600;
      const arrivalTime1 = currentTime + 7200;
      const departureTime2 = currentTime + 14400;
      const arrivalTime2 = currentTime + 18000;
      const departureTime3 = currentTime + 86400;
      const arrivalTime3 = currentTime + 90000;
      
      await schedule.createSchedule(
        1, 1, 2, 3, departureTime1, arrivalTime1, "2023-07-01", 600
      );
      await schedule.createSchedule(
        1, 2, 1, 4, departureTime2, arrivalTime2, "2023-07-01", 600
      );
      await schedule.createSchedule(
        1, 1, 2, 3, departureTime3, arrivalTime3, "2023-07-02", 600
      );
      
      const schedulesForJuly1 = await schedule.getSchedulesByDate("2023-07-01");
      
      expect(schedulesForJuly1.length).to.equal(2);
      
      // Verify schedules are from the requested date
      for (let i = 0; i < schedulesForJuly1.length; i++) {
        const scheduleInfo = await schedule.getSchedule(schedulesForJuly1[i]);
        expect(scheduleInfo.journeyDate).to.equal("2023-07-01");
      }
    });
    
    it("Should fail when unauthorized user tries to create a schedule", async function() {
      const currentTime = Math.floor(Date.now() / 1000);
      const departureTime = currentTime + 3600;
      const arrivalTime = currentTime + 7200;
      
      await expect(
        schedule.connect(addr1).createSchedule(
          1, 1, 2, 3, departureTime, arrivalTime, "2023-07-01", 600
        )
      ).to.be.reverted;
    });
  });
}); 