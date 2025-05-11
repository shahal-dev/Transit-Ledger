import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const chainIds = {
  // goerli: 5,
  // kovan: 42,
  // mainnet: 1,
  // rinkeby: 4,
  // sepolia: 11155111,
  // ropsten: 3,
  // bsctest: 97,
  // bscmain: 56,
  // mumbai: 80001,
  // polygon: 137,
  // fuji: 43113,
  // avalanche: 43114,
  // alfajores: 44787,
  // celo: 42220,
  // arbitrumgoerli: 421613,
  // optimismgoerli: 420,
  // fantomtest: 0xfa2
  hardhat: 31337,
  amoy: 80002,
};

// Environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PRIVATE_KEY1 = process.env.PRIVATE_KEY1;
const API_KEY = process.env.RPC_NODE_API_KEY;
const MNEMONIC = process.env.MNEMONIC;
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "";

const defaultRPCNodeProvider = process.env.RPC_PROVIDER;

const getRPCURL = (network: string, RPCNodeProvider?: string): string => {
  if (!RPCNodeProvider) return "";
  
  switch (RPCNodeProvider) {
    case "moralis":
      return `https://speedy-nodes-nyc.moralis.io/${API_KEY}/eth/${network}`;
      
    case "alchemy":
      return `https://eth-${network}.g.alchemy.com/v2/${API_KEY}`;
  
    case "infura":
      return `https://${network}.infura.io/v3/${API_KEY}`;
      
    case "datahub":
      return `https://ethereum-${network}--rpc.datahub.figment.io//apikey/${API_KEY}`;
      
    default:
      console.error("Unknown provider:", RPCNodeProvider);
      return "";
  }
};

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      accounts: MNEMONIC ? {
        mnemonic: MNEMONIC,
      } : undefined,
      chainId: chainIds.hardhat,
    },
    polygon_amoy: {
      url: "https://rpc-amoy.polygon.technology",
      accounts: PRIVATE_KEY ? [`0x${PRIVATE_KEY}`] : [],
      chainId: chainIds.amoy,
    }
    // Commented networks removed to simplify config
  },
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: { enabled: true, runs: 200 },
          evmVersion: "paris",
          viaIR: true
        },
      },
    ],
  },
  gasReporter: {
    currency: 'USD',
    enabled: true,
  },
  typechain: {
    outDir: "./frontend/typechain",
    target: "ethers-v5",
  },
  etherscan: {
    apiKey: POLYGONSCAN_API_KEY
  }
};

export default config;
