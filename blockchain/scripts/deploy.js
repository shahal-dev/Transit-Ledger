// Script for deploying the TransitLedger contracts
const { ethers } = require("hardhat");

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

  // Return the contract addresses
  return {
    transitToken: await transitToken.getAddress(),
    train: await train.getAddress(),
    station: await station.getAddress(),
    schedule: await schedule.getAddress(),
    ticketNFT: await ticketNFT.getAddress(),
    smartWalletImplementation: await smartWalletImplementation.getAddress(),
    smartWalletFactory: await smartWalletFactory.getAddress()
  };
}

// Execute the deployment and handle errors
main()
  .then((addresses) => {
    console.log("Contract addresses:", addresses);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 