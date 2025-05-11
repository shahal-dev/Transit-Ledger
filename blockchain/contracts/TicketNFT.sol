// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "./Schedule.sol";
import "./TransitToken.sol";

/**
 * @title TicketNFT
 * @dev ERC721 token representing train tickets for the TransitLedger platform
 */
contract TicketNFT is ERC721, Ownable {
    using Strings for uint256;
    
    // Counter for token IDs
    uint256 private _nextTokenId;
    
    // Token URIs mapping
    mapping(uint256 => string) private _tokenURIs;
    
    struct TicketMetadata {
        uint256 trainId;
        uint256 scheduleId;
        string seatNumber;
        uint256 issuedAt;
        string status; // booked, used, cancelled
    }
    
    // Mapping from tokenId to ticket metadata
    mapping(uint256 => TicketMetadata) public tickets;
    
    // Events
    event TicketMinted(uint256 indexed tokenId, address indexed to, uint256 trainId, uint256 scheduleId, string seatNumber);
    event TicketUsed(uint256 indexed tokenId, uint256 timestamp);
    event TicketCancelled(uint256 indexed tokenId, uint256 timestamp);
    
    /**
     * @dev Constructor
     */
    constructor() ERC721("TransitTicket", "TTKT") Ownable(msg.sender) {}
    
    /**
     * @dev Set the token URI
     * @param tokenId The token ID
     * @param uri The token URI
     */
    function _setTokenURI(uint256 tokenId, string memory uri) internal {
        require(_exists(tokenId), "URI set of nonexistent token");
        _tokenURIs[tokenId] = uri;
    }
    
    /**
     * @dev Get the token URI
     * @param tokenId The token ID
     * @return The token URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");
        
        string memory uri = _tokenURIs[tokenId];
        if (bytes(uri).length > 0) {
            return uri;
        }
        
        return "";
    }
    
    /**
     * @dev Mint a new ticket NFT
     * @param to The address that will receive the ticket
     * @param metadataURI The URI for the ticket metadata
     * @param trainId The ID of the train
     * @param scheduleId The ID of the schedule
     * @param seatNumber The seat number (e.g., "A1", "B5")
     * @return tokenId The ID of the minted ticket
     */
    function mintTicket(
        address to,
        string memory metadataURI,
        uint256 trainId,
        uint256 scheduleId,
        string memory seatNumber
    ) public onlyOwner returns (uint256) {
        _nextTokenId++;
        uint256 tokenId = _nextTokenId;
        
        // Mint the NFT
        _mint(to, tokenId);
        
        // Set the metadata URI
        _setTokenURI(tokenId, metadataURI);
        
        // Store the ticket metadata
        tickets[tokenId] = TicketMetadata({
            trainId: trainId,
            scheduleId: scheduleId,
            seatNumber: seatNumber,
            issuedAt: block.timestamp,
            status: "booked"
        });
        
        emit TicketMinted(tokenId, to, trainId, scheduleId, seatNumber);
        
        return tokenId;
    }
    
    /**
     * @dev Generate a token URI with embedded metadata
     * @param trainId The ID of the train
     * @param scheduleId The ID of the schedule
     * @param seatNumber The seat number
     * @return uri The full metadata URI
     */
    function generateTokenURI(
        uint256 trainId,
        uint256 scheduleId,
        string memory seatNumber
    ) public pure returns (string memory) {
        bytes memory metadata = abi.encodePacked(
            '{',
            '"name": "TransitTicket #', trainId.toString(), '-', scheduleId.toString(), '",',
            '"description": "Train ticket for TransitLedger platform",',
            '"attributes": [',
            '{"trait_type": "Train ID", "value": "', trainId.toString(), '"},',
            '{"trait_type": "Schedule ID", "value": "', scheduleId.toString(), '"},',
            '{"trait_type": "Seat Number", "value": "', seatNumber, '"},',
            '{"trait_type": "Ticket Status", "value": "Valid"}',
            ']',
            '}'
        );
        
        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(metadata)
            )
        );
    }
    
    /**
     * @dev Mark a ticket as used
     * @param tokenId The ID of the ticket to mark as used
     */
    function useTicket(uint256 tokenId) public onlyOwner {
        require(_exists(tokenId), "Ticket does not exist");
        require(keccak256(bytes(tickets[tokenId].status)) == keccak256(bytes("booked")), "Ticket is not in booked status");
        
        tickets[tokenId].status = "used";
        emit TicketUsed(tokenId, block.timestamp);
    }
    
    /**
     * @dev Cancel a ticket
     * @param tokenId The ID of the ticket to cancel
     */
    function cancelTicket(uint256 tokenId) public {
        require(_exists(tokenId), "Ticket does not exist");
        require(keccak256(bytes(tickets[tokenId].status)) == keccak256(bytes("booked")), "Ticket is not in booked status");
        
        // Only the owner of the ticket or the contract owner can cancel
        require(ownerOf(tokenId) == msg.sender || owner() == msg.sender, "Not authorized to cancel this ticket");
        
        tickets[tokenId].status = "cancelled";
        emit TicketCancelled(tokenId, block.timestamp);
    }
    
    /**
     * @dev Get the status of a ticket
     * @param tokenId The ID of the ticket
     * @return The status of the ticket
     */
    function getTicketStatus(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Ticket does not exist");
        return tickets[tokenId].status;
    }
    
    /**
     * @dev Get the metadata of a ticket
     * @param tokenId The ID of the ticket
     * @return The metadata of the ticket
     */
    function getTicketMetadata(uint256 tokenId) public view returns (TicketMetadata memory) {
        require(_exists(tokenId), "Ticket does not exist");
        return tickets[tokenId];
    }
    
    /**
     * @dev Check if a token exists
     * @param tokenId The ID of the token to check
     * @return Whether the token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
} 