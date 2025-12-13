# PetsOfBase Smart Contract Deployment Guide

This guide walks you through deploying the PetPFP.sol NFT contract to Base mainnet and integrating it with the PetsOfBase application.

## Prerequisites

- MetaMask or another Web3 wallet with ETH on Base mainnet
- Base mainnet ETH for gas fees (approximately 0.001-0.005 ETH)
- Access to the PetsOfBase project settings

## Step 1: Deploy the Smart Contract

### Option A: Deploy via Remix IDE (Recommended for Beginners)

1. **Open Remix IDE**
   - Go to https://remix.ethereum.org

2. **Create the Contract File**
   - Create a new file: `contracts/PetPFP.sol`
   - Copy the contract code from `/home/ubuntu/PetsOfBase/contracts/PetPFP.sol`

3. **Install OpenZeppelin Contracts**
   - In Remix, go to the "Plugin Manager" and activate "Solidity Compiler"
   - The contract imports OpenZeppelin, which Remix will automatically fetch

4. **Compile the Contract**
   - Select Solidity Compiler (left sidebar)
   - Choose compiler version: `0.8.20` or higher
   - Click "Compile PetPFP.sol"
   - Ensure no errors appear

5. **Deploy to Base Mainnet**
   - Select "Deploy & Run Transactions" (left sidebar)
   - Environment: Select "Injected Provider - MetaMask"
   - Connect your MetaMask wallet
   - **Switch MetaMask to Base Mainnet**:
     - Network Name: Base Mainnet
     - RPC URL: https://mainnet.base.org
     - Chain ID: 8453
     - Currency Symbol: ETH
     - Block Explorer: https://basescan.org
   - Select contract: `PetPFP`
   - Click "Deploy"
   - Confirm the transaction in MetaMask
   - **Save the deployed contract address** (you'll need this!)

### Option B: Deploy via Hardhat/Foundry (Advanced)

```bash
# Install dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Create deployment script
npx hardhat run scripts/deploy.js --network base

# Save the contract address from the output
```

## Step 2: Verify the Contract on BaseScan

1. Go to https://basescan.org
2. Search for your contract address
3. Click "Contract" → "Verify and Publish"
4. Select:
   - Compiler Type: Solidity (Single file)
   - Compiler Version: v0.8.20+commit...
   - License: MIT
5. Paste the flattened contract code (including OpenZeppelin imports)
6. Click "Verify and Publish"

## Step 3: Create a Minter Wallet

The minter wallet is a server-side wallet that will mint NFTs on behalf of users after they pay.

1. **Generate a New Ethereum Wallet**
   ```bash
   # Using ethers.js or web3.js
   node -e "const ethers = require('ethers'); const wallet = ethers.Wallet.createRandom(); console.log('Address:', wallet.address); console.log('Private Key:', wallet.privateKey);"
   ```

2. **Fund the Minter Wallet**
   - Send 0.01-0.05 ETH to the minter wallet address
   - This covers gas fees for minting NFTs

3. **Grant Minter Permissions**
   - The contract uses `onlyOwner` modifier for minting
   - You have two options:
     
     **Option A: Transfer ownership to minter wallet**
     - Call `transferOwnership(minterWalletAddress)` on the contract
     - This makes the minter wallet the contract owner
     
     **Option B: Keep ownership and use a proxy pattern** (Recommended)
     - Keep your main wallet as owner
     - The server will call `mintPet` from the minter wallet
     - You'll need to modify the contract to add a `minter` role, OR
     - Transfer ownership to minter and keep your wallet address stored separately

## Step 4: Configure Environment Variables (Vercel)

Add these required environment variables to your Vercel project:

### Via Vercel Settings UI:

1. Vercel Project → **Settings** → **Environment Variables**
2. Add the following values:

**1. PAYMENT_RECIPIENT_ADDRESS**
- **Value**: Your wallet address that will receive USDC payments
- **Example**: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`
- **Description**: All user payments (**$0.50 USDC per mint**) will be sent here

**2. NFT_CONTRACT_ADDRESS**
- **Value**: The deployed PetPFP contract address from Step 1
- **Example**: `0x1234567890abcdef1234567890abcdef12345678`
- **Description**: The smart contract address on Base mainnet

**3. NFT_MINTER_PRIVATE_KEY**
- **Value**: The private key of the minter wallet from Step 3
- **Example**: `0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890`
- **Description**: Used by the server to sign minting transactions
- **⚠️ SECURITY**: Never commit this to git or share it publicly!

## Step 5: Update Payment Configuration

The application currently runs in "Demo Mode" without payment protection. After adding the environment variables:

1. **Restart the development server**
   - The server will detect the new environment variables
   - Payment protection will be automatically enabled

2. **Verify Payment Integration**
   - Check server logs for: `[Payment Protection] Enabled with recipient: 0x...`
   - Test the minting flow:
     - Upload a pet
     - Generate a PFP
     - Click "Mint as NFT"
     - You should see a USDC payment request for **$0.50 USDC**

## Step 6: Test the Integration

### Test Minting Flow:

1. **Prepare Test USDC**
   - Get Base USDC from a DEX or bridge
   - USDC Contract on Base: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

2. **Test End-to-End**
   - Upload a pet photo
   - Generate a PFP (use free generations or pay $0.10)
   - Click "Mint as NFT" (**$0.50 USDC**)
   - Approve USDC spending in MetaMask
   - Confirm the minting transaction
   - Verify NFT appears in your wallet
   - Check BaseScan for the transaction

3. **Verify NFT Metadata**
   - View the NFT on OpenSea: `https://opensea.io/assets/base/{contractAddress}/{tokenId}`
   - Ensure image and metadata display correctly

## Step 7: Monitor and Maintain

### Monitor Minter Wallet Balance:
```bash
# Check ETH balance regularly
# If balance drops below 0.005 ETH, refund it
```

### Monitor Contract Activity:
- View transactions on BaseScan: `https://basescan.org/address/{contractAddress}`
- Track total mints: Call `totalSupply()` on the contract
- Monitor gas costs and adjust minter wallet funding

### Security Best Practices:
- ✅ Store `NFT_MINTER_PRIVATE_KEY` only in environment variables
- ✅ Never log or expose the private key
- ✅ Use a dedicated minter wallet (not your personal wallet)
- ✅ Keep minter wallet funded but not over-funded (0.01-0.05 ETH)
- ✅ Regularly backup your contract owner wallet private key
- ✅ Consider using a multisig wallet for contract ownership

## Troubleshooting

### "Insufficient funds for gas"
- Fund the minter wallet with more ETH

### "Transaction reverted: Ownable: caller is not the owner"
- Ensure the minter wallet address is the contract owner
- Or transfer ownership to the minter wallet

### "USDC approval failed"
- User needs to approve USDC spending first
- Check USDC contract address is correct for Base mainnet

### "NFT not appearing in wallet"
- Check transaction on BaseScan
- NFT may take a few minutes to appear
- Verify tokenURI is accessible

## Contract Details

- **Contract Name**: PetsOfBase PFP
- **Symbol**: PETPFP
- **Standard**: ERC-721
- **Network**: Base Mainnet (Chain ID: 8453)
- **Features**:
  - Mintable by owner only
  - Stores pet ID mapping
  - Supports metadata URIs
  - OpenZeppelin standard implementation

## Next Steps After Deployment

1. **Announce the Launch**
   - Share the contract address on social media
   - Update the website with "Now Live on Base!" messaging

2. **Add Contract to OpenSea**
   - OpenSea will automatically index Base NFTs
   - Customize collection metadata on OpenSea

3. **Enable Analytics**
   - Track minting volume
   - Monitor revenue from minting fees
   - Analyze user engagement

4. **Plan Future Features**
   - Staking for rewards
   - Breeding mechanics
   - Rarity traits
   - Community governance

---

**Need Help?**

- Base Documentation: https://docs.base.org
- OpenZeppelin Contracts: https://docs.openzeppelin.com/contracts
- Remix IDE: https://remix.ethereum.org
- BaseScan: https://basescan.org
