# PetPFP Smart Contract Deployment Guide

## Contract Overview

The `PetPFP.sol` contract is an ERC-721 NFT contract for PetsOfBase pet profile pictures. It extends OpenZeppelin's battle-tested contracts and includes:

- **ERC-721** standard compliance
- **Metadata URI storage** for each token
- **Pet ID mapping** to link NFTs to database records
- **Owner-only minting** for security
- **Event emission** for tracking mints

## Deployment Steps

### Prerequisites

1. **Wallet with Base ETH:**
   - For testnet: Get Base Sepolia ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
   - For mainnet: Bridge ETH to Base via [Base Bridge](https://bridge.base.org/)

2. **Tools:**
   - [Remix IDE](https://remix.ethereum.org/) (easiest, no setup)
   - OR [Hardhat](https://hardhat.org/) (for advanced users)
   - OR [Foundry](https://book.getfoundry.sh/) (for Rust-based tooling)

### Option 1: Deploy with Remix (Recommended)

1. **Open Remix IDE:**
   - Go to [https://remix.ethereum.org/](https://remix.ethereum.org/)

2. **Create Contract File:**
   - Create a new file: `PetPFP.sol`
   - Copy the entire contract code from `contracts/PetPFP.sol`

3. **Install OpenZeppelin:**
   - Remix will auto-import OpenZeppelin contracts
   - OR manually add via GitHub: `@openzeppelin/contracts@5.0.0`

4. **Compile:**
   - Select Solidity compiler version: `0.8.20` or higher
   - Click "Compile PetPFP.sol"

5. **Deploy:**
   - Go to "Deploy & Run Transactions" tab
   - Select "Injected Provider - MetaMask"
   - **For testnet:** Switch MetaMask to "Base Sepolia"
   - **For mainnet:** Switch MetaMask to "Base"
   - Click "Deploy"
   - Confirm transaction in MetaMask

6. **Save Contract Address:**
   - Copy the deployed contract address
   - Add it to your `.env` file as `NFT_CONTRACT_ADDRESS`

### Option 2: Deploy with Hardhat

```bash
# Install dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts

# Initialize Hardhat
npx hardhat init

# Copy PetPFP.sol to contracts/
cp contracts/PetPFP.sol hardhat-project/contracts/

# Create deployment script
# (See hardhat-deploy-script.js below)

# Deploy to Base Sepolia (testnet)
npx hardhat run scripts/deploy.js --network base-sepolia

# Deploy to Base (mainnet)
npx hardhat run scripts/deploy.js --network base
```

**Hardhat Config (`hardhat.config.js`):**

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    "base-sepolia": {
      url: "https://sepolia.base.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 84532,
    },
    base: {
      url: "https://mainnet.base.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 8453,
    },
  },
};
```

**Deploy Script (`scripts/deploy.js`):**

```javascript
const hre = require("hardhat");

async function main() {
  const PetPFP = await hre.ethers.getContractFactory("PetPFP");
  const petPFP = await PetPFP.deploy();
  await petPFP.waitForDeployment();

  const address = await petPFP.getAddress();
  console.log("PetPFP deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### Network Details

#### Base Sepolia (Testnet)
- **RPC URL:** `https://sepolia.base.org`
- **Chain ID:** `84532`
- **Block Explorer:** [https://sepolia.basescan.org/](https://sepolia.basescan.org/)
- **Faucet:** [https://www.coinbase.com/faucets/base-ethereum-goerli-faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)

#### Base (Mainnet)
- **RPC URL:** `https://mainnet.base.org`
- **Chain ID:** `8453`
- **Block Explorer:** [https://basescan.org/](https://basescan.org/)
- **Bridge:** [https://bridge.base.org/](https://bridge.base.org/)

## Post-Deployment

### 1. Verify Contract on BaseScan

**Via Remix:**
- Go to "Plugin Manager" → Install "Contract Verification"
- Select your deployed contract
- Click "Verify" and follow prompts

**Via Hardhat:**
```bash
npx hardhat verify --network base-sepolia <CONTRACT_ADDRESS>
```

### 2. Update Backend Configuration

Add the contract address to your environment variables:

```bash
# .env
NFT_CONTRACT_ADDRESS=0x... # Your deployed contract address
NFT_CONTRACT_CHAIN_ID=84532 # 84532 for testnet, 8453 for mainnet
```

### 3. Test Minting

Use the backend minting endpoint to test:

```bash
curl -X POST http://localhost:3000/api/mint-nft \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: <payment_payload>" \
  -d '{"petId": 1, "walletAddress": "0x..."}'
```

## Contract Interaction

### Mint a Pet NFT (Owner Only)

```javascript
const tokenId = await contract.mintPet(
  "0x...", // owner address
  1, // pet ID
  "ipfs://..." // metadata URI
);
```

### Get Pet ID from Token

```javascript
const petId = await contract.getPetId(tokenId);
```

### Get Total Supply

```javascript
const total = await contract.totalSupply();
```

## Gas Costs (Estimated)

- **Deployment:** ~1,500,000 gas (~$0.50 on Base)
- **Minting:** ~150,000 gas (~$0.05 on Base)

Base has extremely low gas fees compared to Ethereum mainnet, making it ideal for this use case.

## Security Considerations

1. **Owner-Only Minting:** Only the contract owner (deployer) can mint NFTs
2. **Safe Minting:** Uses `_safeMint` to prevent sending to non-ERC721 receivers
3. **OpenZeppelin:** Built on audited, battle-tested contracts
4. **Metadata Immutability:** Token URIs are set once and cannot be changed

## Metadata Format

Each NFT should have metadata in the following JSON format:

```json
{
  "name": "PetsOfBase #123",
  "description": "A Pixar-style portrait of Max the Golden Retriever",
  "image": "https://storage.example.com/pets/123.png",
  "attributes": [
    { "trait_type": "Species", "value": "Dog" },
    { "trait_type": "Breed", "value": "Golden Retriever" },
    { "trait_type": "Personality", "value": "Friendly" },
    { "trait_type": "Likes", "value": "Fetch, Treats" },
    { "trait_type": "Dislikes", "value": "Baths" }
  ]
}
```

Store this JSON on IPFS or a centralized server and use the URL as the `tokenURI`.

## Support

For deployment issues:
- Check [Base Docs](https://docs.base.org/)
- Ask in [Base Discord](https://discord.gg/buildonbase)
- Review [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
