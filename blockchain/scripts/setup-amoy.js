/**
 * Setup script for Amoy testnet deployment
 * 
 * This script guides users through setting up their .env file for Amoy deployments
 */
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Path to .env file
const envPath = path.join(__dirname, '..', '.env');

console.log('TransitLedger Amoy Setup');
console.log('========================');
console.log('This script will help you set up your .env file for deploying to the Polygon Amoy testnet.');
console.log('');

rl.question('Enter your private key (without 0x prefix): ', (privateKey) => {
  rl.question('Enter your PolygonScan API key (for contract verification, leave blank if not needed): ', (polygonscanKey) => {
    const envContent = `# Network URLs
POLYGON_AMOY_URL=https://rpc-amoy.polygon.technology

# Private Keys (without 0x prefix)
PRIVATE_KEY=${privateKey}

# API Keys for verification
POLYGONSCAN_API_KEY=${polygonscanKey}

# Gas Reporter
REPORT_GAS=true
`;

    fs.writeFileSync(envPath, envContent);
    console.log('\n.env file created successfully!');
    console.log('\nTo deploy to Amoy, run:');
    console.log('npx hardhat run scripts/deploy.ts --network polygon_amoy');
    console.log('\nTo get test MATIC on Amoy:');
    console.log('1. Go to https://mumbaifaucet.com/');
    console.log('2. Connect your wallet and switch to Amoy network');
    console.log('3. Request test MATIC');
    
    rl.close();
  });
}); 