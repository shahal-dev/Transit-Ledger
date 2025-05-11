// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title TransitToken
 * @dev ERC20 token for the TransitLedger platform used for ticket purchases
 */
contract TransitToken is ERC20, ERC20Burnable, Ownable, Pausable {
    /**
     * @dev Constructor that gives the msg.sender all of the initial tokens
     * @param initialSupply The initial token supply (e.g., 1 million tokens)
     */
    constructor(uint256 initialSupply) 
        ERC20("TransitLedger Token", "TLT") 
        Ownable(msg.sender) 
    {
        // Initial supply is converted to tokens with 18 decimals
        _mint(msg.sender, initialSupply * (10 ** decimals()));
    }

    /**
     * @dev Function to mint tokens
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Pause token transfers
     */
    function pause() public onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() public onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override to add pausability to token transfers
     */
    function _update(address from, address to, uint256 amount)
        internal
        override
        whenNotPaused
    {
        super._update(from, to, amount);
    }
} 