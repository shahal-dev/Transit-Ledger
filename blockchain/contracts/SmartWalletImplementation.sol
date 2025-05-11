// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SmartWalletImplementation
 * @dev Minimal implementation contract that will be cloned
 * This is just a placeholder for the actual ERC-4337 compatible wallet implementation
 */
contract SmartWalletImplementation {
    address public owner;
    address public factory;
    
    // Setting these in the constructor will prevent initialization of the implementation contract itself
    constructor() {
        owner = address(0); // Changed to zero address to allow initialization of clones
        factory = address(0);
    }
    
    function initialize(address _owner) external {
        require(owner == address(0), "Already initialized");
        owner = _owner;
        factory = msg.sender;
    }
    
    // Placeholder for future ERC-4337 methods
    function isValidSignature(bytes32 hash, bytes memory signature) external view returns (bytes4) {
        // This will be implemented in the future
        return bytes4(0);
    }
} 