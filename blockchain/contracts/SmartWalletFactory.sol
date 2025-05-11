// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "./SmartWalletImplementation.sol";

/**
 * @title SmartWalletFactory
 * @dev Factory for ERC-4337 compatible smart contract wallets using the minimal proxy pattern
 */
contract SmartWalletFactory is Ownable {
    using Clones for address;
    
    // The implementation contract to clone
    address public immutable walletImplementation;
    
    // Mapping from user identifier to wallet address
    mapping(bytes32 => address) public wallets;
    
    // Mapping from wallet address to user identifier
    mapping(address => bytes32) public walletOwners;
    
    // Events
    event WalletCreated(bytes32 indexed userIdHash, address indexed walletAddress, address indexed owner);
    
    /**
     * @dev Constructor
     * @param _walletImplementation The address of the wallet implementation contract
     */
    constructor(address _walletImplementation) Ownable(msg.sender) {
        require(_walletImplementation != address(0), "Implementation cannot be zero address");
        walletImplementation = _walletImplementation;
    }
    
    /**
     * @dev Deploy the wallet implementation contract
     * @return The address of the implementation contract
     */
    function deployWalletImplementation() external onlyOwner returns (address) {
        SmartWalletImplementation implementation = new SmartWalletImplementation();
        return address(implementation);
    }
    
    /**
     * @dev Create a new wallet for a user
     * @param userIdHash A unique identifier for the user (e.g., keccak256(NID))
     * @param owner The owner address that will control the wallet
     * @param salt A unique salt for deterministic address generation
     * @return walletAddress The address of the new wallet
     */
    function createWallet(bytes32 userIdHash, address owner, bytes32 salt) external onlyOwner returns (address) {
        // Ensure uniqueness
        require(wallets[userIdHash] == address(0), "Wallet already exists for this user");
        require(owner != address(0), "Owner cannot be zero address");
        
        // Create salt based on userIdHash and provided salt
        bytes32 finalSalt = keccak256(abi.encodePacked(userIdHash, salt));
        
        // Clone the implementation
        address walletAddress = Clones.cloneDeterministic(walletImplementation, finalSalt);
        
        // Initialize the wallet
        SmartWalletImplementation(walletAddress).initialize(owner);
        
        // Update mappings
        wallets[userIdHash] = walletAddress;
        walletOwners[walletAddress] = userIdHash;
        
        // Emit event
        emit WalletCreated(userIdHash, walletAddress, owner);
        
        return walletAddress;
    }
    
    /**
     * @dev Predict wallet address before creation
     * @param userIdHash A unique identifier for the user
     * @param salt A unique salt for deterministic address generation
     * @return The predicted address of the wallet
     */
    function predictWalletAddress(bytes32 userIdHash, bytes32 salt) public view returns (address) {
        bytes32 finalSalt = keccak256(abi.encodePacked(userIdHash, salt));
        return Clones.predictDeterministicAddress(walletImplementation, finalSalt);
    }
    
    /**
     * @dev Check if a wallet exists for a user
     * @param userIdHash A unique identifier for the user
     * @return Whether the wallet exists
     */
    function walletExists(bytes32 userIdHash) public view returns (bool) {
        return wallets[userIdHash] != address(0);
    }
    
    /**
     * @dev Get wallet address for a user
     * @param userIdHash A unique identifier for the user
     * @return The wallet address
     */
    function getWalletAddress(bytes32 userIdHash) public view returns (address) {
        address walletAddress = wallets[userIdHash];
        require(walletAddress != address(0), "No wallet exists for this user");
        return walletAddress;
    }
    
    /**
     * @dev Get owner of a wallet
     * @param walletAddress The wallet address
     * @return The user identifier hash
     */
    function getWalletOwner(address walletAddress) public view returns (bytes32) {
        bytes32 userIdHash = walletOwners[walletAddress];
        require(userIdHash != bytes32(0), "Not a wallet created by this factory");
        return userIdHash;
    }
} 