// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PetPFP
 * @dev ERC-721 NFT contract for PetsOfBase pet profile pictures
 * @notice This contract allows minting of pet PFP NFTs with metadata
 */
contract PetPFP is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    
    // Mapping from token ID to pet ID (for reference)
    mapping(uint256 => uint256) public tokenToPetId;
    
    // Events
    event PetMinted(uint256 indexed tokenId, uint256 indexed petId, address indexed owner, string tokenURI);
    
    constructor() ERC721("PetsOfBase PFP", "PETPFP") Ownable(msg.sender) {
        _nextTokenId = 1; // Start token IDs at 1
    }
    
    /**
     * @dev Mint a new Pet PFP NFT
     * @param to The address that will own the minted NFT
     * @param petId The pet ID from the database
     * @param uri The metadata URI for the NFT
     * @return The token ID of the minted NFT
     */
    function mintPet(
        address to,
        uint256 petId,
        string memory uri
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        tokenToPetId[tokenId] = petId;
        
        emit PetMinted(tokenId, petId, to, uri);
        
        return tokenId;
    }
    
    /**
     * @dev Get the pet ID for a given token ID
     * @param tokenId The token ID to query
     * @return The pet ID associated with the token
     */
    function getPetId(uint256 tokenId) public view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenToPetId[tokenId];
    }
    
    /**
     * @dev Get the total number of minted tokens
     * @return The total supply of tokens
     */
    function totalSupply() public view returns (uint256) {
        return _nextTokenId - 1;
    }
    
    // The following functions are overrides required by Solidity.
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
