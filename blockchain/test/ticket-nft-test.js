const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TicketNFT", function() {
  let ticketNFT;
  let owner;
  let addr1;
  let addr2;
  
  beforeEach(async function() {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const TicketNFT = await ethers.getContractFactory("TicketNFT");
    ticketNFT = await TicketNFT.deploy();
  });
  
  describe("Ticket Management", function() {
    it("Should allow minting a new ticket", async function() {
      const trainId = 1;
      const scheduleId = 1;
      const seatNumber = "A1";
      
      const metadataURI = await ticketNFT.generateTokenURI(trainId, scheduleId, seatNumber);
      const tx = await ticketNFT.mintTicket(addr1.address, metadataURI, trainId, scheduleId, seatNumber);
      const receipt = await tx.wait();
      
      // Find the TicketMinted event
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === 'TicketMinted'
      );
      const tokenId = event.args[0];
      
      // Verify the ticket ownership
      expect(await ticketNFT.ownerOf(tokenId)).to.equal(addr1.address);
      
      // Verify the ticket metadata
      const ticketMetadata = await ticketNFT.getTicketMetadata(tokenId);
      expect(ticketMetadata.trainId).to.equal(trainId);
      expect(ticketMetadata.scheduleId).to.equal(scheduleId);
      expect(ticketMetadata.seatNumber).to.equal(seatNumber);
      expect(ticketMetadata.status).to.equal("booked");
    });
    
    it("Should allow using a ticket", async function() {
      // First mint a ticket
      const metadataURI = await ticketNFT.generateTokenURI(1, 1, "A1");
      const tx = await ticketNFT.mintTicket(addr1.address, metadataURI, 1, 1, "A1");
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'TicketMinted');
      const tokenId = event.args[0];
      
      // Use the ticket
      await ticketNFT.useTicket(tokenId);
      
      // Verify the ticket status is updated
      const ticketMetadata = await ticketNFT.getTicketMetadata(tokenId);
      expect(ticketMetadata.status).to.equal("used");
    });
    
    it("Should allow ticket owner to cancel a ticket", async function() {
      // First mint a ticket
      const metadataURI = await ticketNFT.generateTokenURI(1, 1, "A1");
      const tx = await ticketNFT.mintTicket(addr1.address, metadataURI, 1, 1, "A1");
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'TicketMinted');
      const tokenId = event.args[0];
      
      // Cancel the ticket by the owner (addr1)
      await ticketNFT.connect(addr1).cancelTicket(tokenId);
      
      // Verify the ticket status is updated
      const ticketMetadata = await ticketNFT.getTicketMetadata(tokenId);
      expect(ticketMetadata.status).to.equal("cancelled");
    });
    
    it("Should fail when non-owner tries to cancel a ticket", async function() {
      // First mint a ticket to addr1
      const metadataURI = await ticketNFT.generateTokenURI(1, 1, "A1");
      const tx = await ticketNFT.mintTicket(addr1.address, metadataURI, 1, 1, "A1");
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'TicketMinted');
      const tokenId = event.args[0];
      
      // Try to cancel the ticket from addr2 (not owner)
      await expect(
        ticketNFT.connect(addr2).cancelTicket(tokenId)
      ).to.be.revertedWith("Not authorized to cancel this ticket");
    });
    
    it("Should fail to use a cancelled ticket", async function() {
      // First mint a ticket
      const metadataURI = await ticketNFT.generateTokenURI(1, 1, "A1");
      const tx = await ticketNFT.mintTicket(addr1.address, metadataURI, 1, 1, "A1");
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'TicketMinted');
      const tokenId = event.args[0];
      
      // Cancel the ticket
      await ticketNFT.cancelTicket(tokenId);
      
      // Try to use the cancelled ticket
      await expect(
        ticketNFT.useTicket(tokenId)
      ).to.be.revertedWith("Ticket is not in booked status");
    });
    
    it("Should generate valid token URI with metadata", async function() {
      const trainId = 5;
      const scheduleId = 10;
      const seatNumber = "B7";
      
      const uri = await ticketNFT.generateTokenURI(trainId, scheduleId, seatNumber);
      
      // URI should be a base64 encoded data URL
      expect(uri).to.include("data:application/json;base64,");
      
      // Decode the base64 URI and check the content
      const encodedData = uri.split("base64,")[1];
      const decodedData = Buffer.from(encodedData, 'base64').toString();
      const jsonData = JSON.parse(decodedData);
      
      expect(jsonData.name).to.include("TransitTicket #5-10");
      expect(jsonData.description).to.include("Train ticket");
      
      // Check attributes
      const trainIdAttr = jsonData.attributes.find(attr => attr.trait_type === "Train ID");
      const scheduleIdAttr = jsonData.attributes.find(attr => attr.trait_type === "Schedule ID");
      const seatAttr = jsonData.attributes.find(attr => attr.trait_type === "Seat Number");
      
      expect(trainIdAttr.value).to.equal("5");
      expect(scheduleIdAttr.value).to.equal("10");
      expect(seatAttr.value).to.equal("B7");
    });
  });
}); 