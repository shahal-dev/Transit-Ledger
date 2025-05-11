const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Train", function() {
  let train;
  let owner;
  let addr1;
  
  beforeEach(async function() {
    [owner, addr1] = await ethers.getSigners();
    
    const Train = await ethers.getContractFactory("Train");
    train = await Train.deploy();
  });
  
  describe("Train Management", function() {
    it("Should allow adding a new train", async function() {
      const trainId = 1;
      const trainName = "Express 101";
      const trainNumber = "E101";
      const coachCount = 10;
      const seatsPerCoach = 60;
      
      await train.addTrain(trainName, trainNumber, coachCount, seatsPerCoach);
      
      const trainInfo = await train.getTrain(trainId);
      expect(trainInfo.name).to.equal(trainName);
      expect(trainInfo.trainNumber).to.equal(trainNumber);
      expect(trainInfo.coachCount).to.equal(coachCount);
      expect(trainInfo.seatsPerCoach).to.equal(seatsPerCoach);
      expect(trainInfo.operational).to.equal(true);
    });
    
    it("Should allow updating train details", async function() {
      // First add a train
      await train.addTrain("Initial Name", "T100", 8, 50);
      
      // Then update it
      const trainId = 1;
      const newName = "Updated Express";
      const newCoachCount = 12;
      const operational = true;
      
      await train.updateTrain(trainId, newName, newCoachCount, operational);
      
      const trainInfo = await train.getTrain(trainId);
      expect(trainInfo.name).to.equal(newName);
      expect(trainInfo.coachCount).to.equal(newCoachCount);
      // These should remain unchanged
      expect(trainInfo.trainNumber).to.equal("T100");
      expect(trainInfo.seatsPerCoach).to.equal(50);
    });
    
    it("Should fail when unauthorized user tries to add a train", async function() {
      await expect(
        train.connect(addr1).addTrain("Unauthorized Train", "UT100", 5, 40)
      ).to.be.reverted;
    });
    
    it("Should allow getting all trains", async function() {
      // Add multiple trains
      await train.addTrain("Train 1", "T1", 8, 50);
      await train.addTrain("Train 2", "T2", 10, 60);
      
      const trainIds = await train.getAllTrains();
      
      expect(trainIds.length).to.equal(2);
      
      // Get details of each train
      const train1 = await train.getTrain(trainIds[0]);
      const train2 = await train.getTrain(trainIds[1]);
      
      expect(train1.name).to.equal("Train 1");
      expect(train2.name).to.equal("Train 2");
    });
  });
}); 