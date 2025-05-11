const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TransitToken", function() {
  let transitToken;
  let owner;
  let addr1;
  let initialSupply = 1000000; // 1 million tokens
  
  beforeEach(async function() {
    [owner, addr1] = await ethers.getSigners();
    
    const TransitToken = await ethers.getContractFactory("TransitToken");
    transitToken = await TransitToken.deploy(initialSupply);
  });
  
  describe("Deployment", function() {
    it("Should set the correct initial supply", async function() {
      // 18 decimals means we multiply by 10^18
      const expectedSupply = ethers.parseUnits(initialSupply.toString(), 18);
      expect(await transitToken.totalSupply()).to.equal(expectedSupply);
    });
    
    it("Should assign all tokens to the owner", async function() {
      const expectedBalance = ethers.parseUnits(initialSupply.toString(), 18);
      expect(await transitToken.balanceOf(owner.address)).to.equal(expectedBalance);
    });
  });
  
  describe("Transactions", function() {
    it("Should transfer tokens between accounts", async function() {
      // Transfer 100 tokens
      const transferAmount = ethers.parseUnits("100", 18);
      await transitToken.transfer(addr1.address, transferAmount);
      
      // Check balances
      expect(await transitToken.balanceOf(addr1.address)).to.equal(transferAmount);
    });
    
    it("Should fail if sender doesn't have enough tokens", async function() {
      // Try to transfer more than the owner has
      const initialSupplyBN = await transitToken.totalSupply();
      const excessiveAmount = initialSupplyBN + ethers.parseUnits("1", 18);
      
      await expect(
        transitToken.transfer(addr1.address, excessiveAmount)
      ).to.be.reverted;
    });
  });
}); 