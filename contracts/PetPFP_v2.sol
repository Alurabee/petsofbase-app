// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PetPFP v2
 * @dev ERC-721 NFT contract for PetsOfBase pet profile pictures
 * @notice This contract allows public minting of pet PFP NFTs
 * Users pay their own gas and mint directly from the frontend
 */
contract PetPFP is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    
    // Mapping from token ID to pet ID (for reference)
    mapping(uint256 => uint256) public tokenToPetId;
    
    // Mapping to prevent duplicate minting of the same pet
    mapping(uint256 => bool) public petMinted;
    
    // Events
    event PetMinted(uint256 indexed tokenId, uint256 indexed petId, address indexed owner, string tokenURI);
    
    constructor() ERC721("PetsOfBase PFP", "PETPFP") Ownable(msg.sender) {
        _nextTokenId = 1; // Start token IDs at 1
    }
    
    /**
     * @dev Mint a new Pet PFP NFT (PUBLIC - anyone can mint)
     * @param petId The pet ID from the database
     * @param uri The metadata URI for the NFT
     * @return The token ID of the minted NFT
     * @notice Users must pay their own gas fees
     */
    function mintPet(
        uint256 petId,
        string memory uri
    ) public returns (uint256) {
        // Prevent duplicate minting of the same pet
        require(!petMinted[petId], "Pet already minted");
        
        uint256 tokenId = _nextTokenId++;
        
        // Mint to the caller (msg.sender)
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        tokenToPetId[tokenId] = petId;
        petMinted[petId] = true;
        
        emit PetMinted(tokenId, petId, msg.sender, uri);
        
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
     * @dev Check if a pet has already been minted
     * @param petId The pet ID to check
     * @return Whether the pet has been minted
     */
    function isPetMinted(uint256 petId) public view returns (bool) {
        return petMinted[petId];
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
