# Base Paymaster Integration Notes

## Overview
Base Paymaster allows sponsoring gas fees for users, making transactions free and improving UX.

## Key Features
- Batch multi-step transactions
- Create custom gasless experiences
- Sponsor up to $15k monthly on mainnet (unlimited on testnet)
- Per-user limits and global limits

## Prerequisites
1. Coinbase Cloud Developer Platform Account (https://portal.cdp.coinbase.com)
2. Familiarity with Smart Accounts and ERC 4337
3. Foundry for development

## Setup Steps
1. Navigate to Coinbase Developer Platform
2. Create/select project
3. Click on Paymaster tool
4. Get RPC URL from Configuration tab
5. Enable paymaster
6. Add allowlisted contracts and functions
7. Set per-user limits (e.g., $0.05 max USD, 1 max UserOperation)
8. Set global limits (e.g., $0.07 total)

## Implementation Approach for PetsOfBase

### Current State
- Charging $0.25 USDC for minting
- Charging for regeneration
- Need to remove all payment requirements

### Integration Plan
1. **Sign up for Coinbase Developer Platform**
   - Create account at https://portal.cdp.coinbase.com
   - Create project for PetsOfBase
   
2. **Configure Paymaster**
   - Enable Base Mainnet paymaster
   - Add PetsOfBase NFT contract address (once deployed)
   - Allowlist functions: `mintTo(address)`, regeneration functions
   - Set per-user limits: reasonable for free minting
   - Set global limits: monitor usage

3. **Update Frontend**
   - Install `permissionless` and `viem` packages
   - Create Smart Account client
   - Use Paymaster RPC URL for sponsored transactions
   - Remove payment UI/logic

4. **Update Backend**
   - Remove payment verification
   - Remove USDC transfer logic
   - Keep NFT minting logic

## Code Structure

```typescript
import { createSmartAccountClient } from 'permissionless';
import { createPimlicoPaymasterClient } from 'permissionless/clients/pimlico';

// Setup Paymaster client
const paymasterClient = createPimlicoPaymasterClient({
  chain: base,
  transport: http(PAYMASTER_RPC_URL),
  entryPoint: BASE_ENTRY_POINT,
});

// Create Smart Account
const smartAccount = await privateKeyToSimpleSmartAccount(publicClient, {
  privateKey: userPrivateKey,
  factoryAddress: BASE_FACTORY_ADDRESS,
  entryPoint: BASE_ENTRY_POINT,
});

// Sponsor transaction
const smartAccountClient = createSmartAccountClient({
  account: smartAccount,
  chain: base,
  bundlerTransport: http(PAYMASTER_RPC_URL),
  middleware: {
    sponsorUserOperation: paymasterClient.sponsorUserOperation,
  },
});
```

## Next Steps
1. Create Coinbase Developer Platform account
2. Deploy NFT contract to Base mainnet
3. Configure Paymaster with contract address
4. Implement Smart Account integration
5. Remove payment logic
6. Test sponsored transactions

## Important Notes
- Need to deploy actual NFT contract first
- Paymaster requires allowlisting specific contract addresses
- Can start with Base Sepolia testnet for testing
- Free $15k monthly sponsorship limit on mainnet
- Can request increase if needed via Discord

## Alternative: Demo Mode
For now, we can:
1. Keep current "Demo Mode" warnings
2. Make minting/regeneration free in demo mode
3. Add note: "Transactions will be sponsored when deployed to Base mainnet"
4. This allows testing without full Paymaster setup
