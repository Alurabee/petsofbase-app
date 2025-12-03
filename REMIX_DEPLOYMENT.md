# Deploy PetPFP Contract via Remix IDE

## Step 1: Open Remix IDE

1. Go to **https://remix.ethereum.org** in your browser
2. You'll see the Remix IDE interface

## Step 2: Create the Contract File

1. In the left sidebar, click the **"File Explorer"** icon (📁)
2. Click the **"+"** button to create a new file
3. Name it: `PetPFP.sol`
4. Copy and paste the contract code below into the file

## Contract Code (Copy Everything Below):

```solidity
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
```

## Step 3: Compile the Contract

1. Click the **"Solidity Compiler"** icon in the left sidebar (looks like "S" with lines)
2. Select compiler version: **0.8.20** or higher (e.g., 0.8.27)
3. Click the blue **"Compile PetPFP.sol"** button
4. Wait for compilation to finish
5. You should see a green checkmark ✅ - no errors!

## Step 4: Connect MetaMask to Base Mainnet

1. Open your MetaMask extension
2. Click the network dropdown (top center)
3. If you don't see "Base Mainnet", add it:
   - Click "Add Network"
   - Click "Add a network manually"
   - Enter these details:
     - **Network Name**: Base Mainnet
     - **RPC URL**: `https://mainnet.base.org`
     - **Chain ID**: `8453`
     - **Currency Symbol**: ETH
     - **Block Explorer**: `https://basescan.org`
   - Click "Save"
4. Switch to **Base Mainnet**
5. **Ensure you have at least 0.002 ETH** in your wallet for gas fees

## Step 5: Deploy the Contract

1. Click the **"Deploy & Run Transactions"** icon in the left sidebar (looks like Ethereum logo)
2. In the "ENVIRONMENT" dropdown, select **"Injected Provider - MetaMask"**
3. MetaMask will pop up - click **"Connect"** to connect your wallet
4. Verify you see:
   - Environment: "Injected Provider - MetaMask"
   - Network: "Custom (8453) network" or "Base Mainnet"
   - Account: Your wallet address
5. In the "CONTRACT" dropdown, select **"PetPFP"**
6. Click the orange **"Deploy"** button
7. MetaMask will pop up with a transaction
8. **Review the gas fee** (should be ~$0.50-$2.00)
9. Click **"Confirm"** in MetaMask
10. Wait for the transaction to confirm (~2-5 seconds)

## Step 6: Save Your Contract Address

1. After deployment, you'll see the contract under "Deployed Contracts"
2. Click the copy icon next to the contract address
3. **SAVE THIS ADDRESS** - you'll need it! It looks like:
   ```
   0x1234567890abcdef1234567890abcdef12345678
   ```
4. Paste it somewhere safe (Notes app, text file, etc.)

## Step 7: Verify on BaseScan

1. Copy your contract address
2. Go to **https://basescan.org**
3. Paste the address in the search bar
4. You should see your contract!
5. Click the "Contract" tab
6. You'll see the bytecode - we'll verify it next

---

## ✅ Checkpoint: What You Should Have Now

- ✅ Contract deployed to Base Mainnet
- ✅ Contract address saved (starts with 0x...)
- ✅ Transaction confirmed on BaseScan

## Next Step

Tell me your contract address, and I'll help you:
1. Verify the contract on BaseScan (makes it readable)
2. Create a minter wallet
3. Configure the environment variables

**Reply with**: "My contract address is 0x..."
