// Script for deploying the TransitLedger contracts
import { ethers } from "hardhat";

async function main() {
  console.log("Deploying TransitLedger contracts...");

  // Get the signers
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy TransitToken
  console.log("Deploying TransitToken...");
  const transitTokenFactory = await ethers.getContractFactory("TransitToken");
  const initialSupply = 1000000; // 1 million tokens (decimal conversion happens in the contract)
  const transitToken = await transitTokenFactory.deploy(initialSupply);
  await transitToken.waitForDeployment();
  console.log("TransitToken deployed to:", await transitToken.getAddress());

  // Deploy Train
  console.log("Deploying Train contract...");
  const trainFactory = await ethers.getContractFactory("Train");
  const train = await trainFactory.deploy();
  await train.waitForDeployment();
  console.log("Train contract deployed to:", await train.getAddress());

  // Deploy Station
  console.log("Deploying Station contract...");
  const stationFactory = await ethers.getContractFactory("Station");
  const station = await stationFactory.deploy();
  await station.waitForDeployment();
  console.log("Station contract deployed to:", await station.getAddress());

  // Deploy Schedule
  console.log("Deploying Schedule contract...");
  const scheduleFactory = await ethers.getContractFactory("Schedule");
  const schedule = await scheduleFactory.deploy(
    await train.getAddress(),
    await station.getAddress()
  );
  await schedule.waitForDeployment();
  console.log("Schedule contract deployed to:", await schedule.getAddress());

  // Deploy TicketNFT
  console.log("Deploying TicketNFT contract...");
  const ticketNFTFactory = await ethers.getContractFactory("TicketNFT");
  const ticketNFT = await ticketNFTFactory.deploy();
  await ticketNFT.waitForDeployment();
  console.log("TicketNFT contract deployed to:", await ticketNFT.getAddress());

  // Deploy SmartWalletImplementation
  console.log("Deploying SmartWalletImplementation...");
  const smartWalletImplementationFactory = await ethers.getContractFactory("SmartWalletImplementation");
  const smartWalletImplementation = await smartWalletImplementationFactory.deploy();
  await smartWalletImplementation.waitForDeployment();
  console.log("SmartWalletImplementation deployed to:", await smartWalletImplementation.getAddress());

  // Deploy SmartWalletFactory
  console.log("Deploying SmartWalletFactory contract...");
  const smartWalletFactoryFactory = await ethers.getContractFactory("SmartWalletFactory");
  const smartWalletFactory = await smartWalletFactoryFactory.deploy(
    await smartWalletImplementation.getAddress()
  );
  await smartWalletFactory.waitForDeployment();
  console.log("SmartWalletFactory contract deployed to:", await smartWalletFactory.getAddress());

  console.log("All contracts deployed successfully!");

  // Mint test tokens for development
  const testAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Default second account in Hardhat node
  const mintAmount = ethers.parseUnits("10000", 18); // 10,000 tokens with 18 decimals
  
  console.log(`Minting ${ethers.formatUnits(mintAmount, 18)} TransitTokens to ${testAddress}...`);
  
  const mintTx = await transitToken.mint(testAddress, mintAmount);
  await mintTx.wait();
  
  const testBalance = await transitToken.balanceOf(testAddress);
  console.log(`Test address balance: ${ethers.formatUnits(testBalance, 18)} TransitTokens`);

  // Return the contract addresses
  const addresses = {
    transitToken: await transitToken.getAddress(),
    train: await train.getAddress(),
    station: await station.getAddress(),
    schedule: await schedule.getAddress(),
    ticketNFT: await ticketNFT.getAddress(),
    smartWalletImplementation: await smartWalletImplementation.getAddress(),
    smartWalletFactory: await smartWalletFactory.getAddress()
  };

  // Save addresses to a file for easy reference
  console.log("Contract addresses:", addresses);
  return addresses;
}

// Execute the deployment and handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 