# TransitLedger Smart Contracts

This directory contains the Ethereum smart contracts for the TransitLedger railway platform.

## Contracts

- **TransitToken.sol**: ERC20 token used for ticket purchases
- **Train.sol**: Stores train metadata
- **Station.sol**: Stores station information
- **Schedule.sol**: Maps trains to platforms at specific times
- **TicketNFT.sol**: ERC-721 NFT representing train tickets
- **SmartWalletFactory.sol**: Factory for ERC-4337 compatible smart contract wallets

## Development Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Compile contracts:
   ```
   npm run compile
   ```

3. Run tests:
   ```
   npm run test
   ```

4. Start local Ethereum node:
   ```
   npm run node
   ```

5. Deploy to local network:
   ```
   npm run deploy:local
   ```

## Contract Interaction

The smart contracts form the backbone of the TransitLedger platform:

1. Railway authorities manage trains, stations, and schedules
2. Users can purchase tickets using TransitToken
3. Tickets are represented as NFTs with unique verification codes
4. ERC-4337 compatible wallets provide seamless user experience

## Architecture

The system uses a layered approach:
- Base data contracts (Train, Station)
- Scheduling layer (Schedule)
- Token/Payment layer (TransitToken)
- Ticket issuance layer (TicketNFT)
- User identity layer (SmartWalletFactory)

Contracts are designed to be upgradeable and use OpenZeppelin libraries for security.
