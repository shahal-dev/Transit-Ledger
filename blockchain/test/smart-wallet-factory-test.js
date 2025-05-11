const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SmartWalletFactory", function() {
  let smartWalletImplementation;
  let smartWalletFactory;
  let owner;
  let addr1;
  let addr2;
  
  beforeEach(async function() {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy SmartWalletImplementation - this will be the real implementation
    const SmartWalletImplementation = await ethers.getContractFactory("SmartWalletImplementation");
    smartWalletImplementation = await SmartWalletImplementation.deploy();
    
    // Deploy SmartWalletFactory
    const SmartWalletFactory = await ethers.getContractFactory("SmartWalletFactory");
    smartWalletFactory = await SmartWalletFactory.deploy(await smartWalletImplementation.getAddress());
    
    // Deploy a new wallet implementation through the factory
    // This ensures we have a properly initialized implementation
    const deployTx = await smartWalletFactory.deployWalletImplementation();
    const receipt = await deployTx.wait();
    
    // Get the implementation address
    // Using the emitted event would be best practice, but for simplicity we'll reuse the original
    // This way we still test the core functionality
  });
  
  describe("Wallet Factory Management", function() {
    it("Should deploy the wallet implementation", async function() {
      const deployedImplementation = await smartWalletFactory.walletImplementation();
      expect(deployedImplementation).to.equal(await smartWalletImplementation.getAddress());
    });
    
    it("Should create a wallet with deterministic address", async function() {
      const userIdHash = ethers.id("user1");
      // Convert to bytes32 format
      const salt = ethers.zeroPadValue("0x01", 32); // Use a simple salt for testing
      
      // Predict the wallet address
      const predictedAddress = await smartWalletFactory.predictWalletAddress(userIdHash, salt);
      
      // Create the wallet
      await smartWalletFactory.createWallet(userIdHash, addr1.address, salt);
      
      // Get the actual wallet address
      const walletAddress = await smartWalletFactory.getWalletAddress(userIdHash);
      
      // Verify prediction matches the actual address
      expect(walletAddress).to.equal(predictedAddress);
      
      // Verify correct owner assignment
      const wallet = await ethers.getContractAt("SmartWalletImplementation", walletAddress);
      expect(await wallet.owner()).to.equal(addr1.address);
    });
    
    it("Should map wallet addresses to user IDs", async function() {
      const userIdHash = ethers.id("user1");
      const salt = ethers.zeroPadValue("0x01", 32);
      
      // Create wallet
      const tx = await smartWalletFactory.createWallet(userIdHash, addr1.address, salt);
      await tx.wait();
      
      const walletAddress = await smartWalletFactory.getWalletAddress(userIdHash);
      
      // Verify mapping from wallet address to user ID
      const retrievedUserIdHash = await smartWalletFactory.getWalletOwner(walletAddress);
      expect(retrievedUserIdHash).to.equal(userIdHash);
    });
    
    it("Should check if a wallet exists for a user", async function() {
      const userIdHash = ethers.id("user1");
      const nonExistentUserIdHash = ethers.id("user2");
      const salt = ethers.zeroPadValue("0x01", 32);
      
      // Create wallet for user1
      await smartWalletFactory.createWallet(userIdHash, addr1.address, salt);
      
      // Check existence
      expect(await smartWalletFactory.walletExists(userIdHash)).to.be.true;
      expect(await smartWalletFactory.walletExists(nonExistentUserIdHash)).to.be.false;
    });
    
    it("Should fail when creating wallet for existing user", async function() {
      const userIdHash = ethers.id("user1");
      const salt1 = ethers.zeroPadValue("0x01", 32);
      const salt2 = ethers.zeroPadValue("0x02", 32);
      
      // Create first wallet
      await smartWalletFactory.createWallet(userIdHash, addr1.address, salt1);
      
      // Try to create another wallet for the same user
      await expect(
        smartWalletFactory.createWallet(userIdHash, addr2.address, salt2)
      ).to.be.revertedWith("Wallet already exists for this user");
    });
    
    it("Should fail when unauthorized user tries to create a wallet", async function() {
      const userIdHash = ethers.id("user1");
      const salt = ethers.zeroPadValue("0x01", 32);
      
      // Try to create wallet from non-owner account
      await expect(
        smartWalletFactory.connect(addr1).createWallet(userIdHash, addr1.address, salt)
      ).to.be.reverted;
    });
    
    it("Should fail when querying non-existent wallet", async function() {
      const nonExistentUserIdHash = ethers.id("nonexistent");
      
      await expect(
        smartWalletFactory.getWalletAddress(nonExistentUserIdHash)
      ).to.be.revertedWith("No wallet exists for this user");
    });
  });
}); 