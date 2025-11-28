# PetsOfBase Research & Technical Documentation

## Executive Summary

This document consolidates research findings for the **PetsOfBase** mini-app, a community-focused Base Mini-App that allows users to mint NFT PFPs of their pets with AI-generated styles, vote on a Cuteness Leaderboard, and pay a small USDC fee via the X402 payment protocol.

---

## 1. Base Mini-App Platform

### Overview

The Base Mini-App platform is designed for social, onchain-native experiences that focus on **creating, earning, trading, and connecting**. The platform emphasizes simplicity, low friction, and viral potential.

### Key Success Factors

| Factor | Description | Application to PetsOfBase |
| :--- | :--- | :--- |
| **One Core Need** | Focus on one thing and do it exceptionally well | **Core need:** Mint a fun, AI-generated pet PFP and compete on a leaderboard |
| **Daily Use** | Why would someone use it every day? | Users return to vote on pets, check leaderboard rankings, and share their pets |
| **Shareability** | Why would someone share it with a friend? | Cute pet content is inherently viral; users share their pet PFPs and compete with friends |
| **Low Friction** | Avoid collecting personal info or requiring upfront deposits | No email, no complex setup—just connect wallet, upload pet, and mint |
| **Onchain Elements** | Integrate blockchain for earning, creating, or collecting | NFT minting, USDC payments, and onchain leaderboard voting |

### Audience Fit

Base users are **social, onchain-native, and interested in creating, earning, trading, and connecting**. PetsOfBase aligns perfectly by combining:

*   **Creating:** AI-generated pet PFPs
*   **Earning:** Potential for future rewards for top-ranked pets
*   **Connecting:** Community bonding over shared love of pets
*   **Fun:** Gamified leaderboard and voting

### Technical Stack

The Base Mini-App quickstart template uses:

*   **Frontend:** Next.js/React with TypeScript
*   **Backend:** Next.js API Routes (or Express.js)
*   **Deployment:** Vercel
*   **Manifest:** `minikit.config.ts` for app metadata and account association

---

## 2. X402 Payment Protocol

### Overview

The **X402 protocol** is an open standard for internet-native payments built around the HTTP 402 status code. It enables users to pay for resources via API without registration, emails, OAuth, or complex signatures.

### Key Features

| Feature | Description |
| :--- | :--- |
| **No Fees** | 0% protocol fees for both customer and merchant |
| **Instant Settlement** | Money in your wallet in ~2 seconds (blockchain speed) |
| **Blockchain Agnostic** | Works with any blockchain or token (Base, Ethereum, Solana, etc.) |
| **Frictionless** | As little as 1 line of middleware code to accept payments |
| **Web Native** | Uses HTTP 402 status code and works with any HTTP stack |

### Integration Method

The X402 protocol is implemented as a **middleware** in the backend. When a user tries to access a protected API endpoint (e.g., `/api/mint-nft`), the server responds with an **HTTP 402 Payment Required** status if no payment is detected. The Base app's wallet will then handle the payment and retry the request.

**Example Implementation (Express.js):**

```typescript
import { paymentMiddleware } from "x402-express";

app.use(
  paymentMiddleware("0xYourWalletAddress", {
    "/api/mint-nft": "$0.25"
  })
);
```

**Example Implementation (Next.js API Route):**

```typescript
// pages/api/mint-nft.ts
import { paymentMiddleware } from "x402-nextjs";

export default paymentMiddleware("0xYourWalletAddress", {
  price: "$0.25"
})(async (req, res) => {
  // Your NFT minting logic here
  res.status(200).json({ success: true });
});
```

### Network Support

The X402 protocol explicitly supports:

*   **Base** (mainnet)
*   **Base-Sepolia** (testnet)
*   Other EVM-compatible chains

### GitHub Repository

*   **URL:** [https://github.com/coinbase/x402](https://github.com/coinbase/x402)
*   **Documentation:** Available in the repository's README and `examples/typescript/servers/express/index.ts`

---

## 3. Pricing Model & Cost Analysis

### User Price: $0.25 USDC per NFT Mint

This price is strategically chosen to be:

*   **Low enough** to encourage mass adoption and viral sharing
*   **High enough** to generate meaningful revenue
*   **Aligned with micro-payment best practices** for Base Mini-Apps

### Cost Breakdown

| Cost Component | Estimated Cost (USD) | Notes |
| :--- | :--- | :--- |
| **AI Image Generation (DALL-E 3)** | $0.04 per image | Standard 1024x1024 resolution |
| **Base Gas Fee (NFT Mint)** | $0.0001 - $0.001 | Base L2 gas fees are extremely low |
| **Total Variable Cost** | **$0.04 - $0.05** | Cost incurred per successful mint |
| **Your Revenue/Profit** | **$0.20 - $0.21** | Profit per successful mint |
| **User Price (X402 Fee)** | **$0.25 USDC** | Final price charged to the user |

### Profitability Analysis

*   **Profit Margin:** ~80-84% per mint
*   **Break-even:** 1 mint
*   **Revenue at 100 mints:** $20-21 profit
*   **Revenue at 1,000 mints:** $200-210 profit
*   **Revenue at 10,000 mints:** $2,000-2,100 profit

### Competitive Pricing Research

| Platform | Typical NFT Mint Cost | Notes |
| :--- | :--- | :--- |
| **Ethereum (OpenSea)** | $50-150 (low congestion) | Extremely high gas fees |
| **Polygon** | $0.10 | Low-cost L2 |
| **Solana** | $0.005 | Very low cost |
| **Avalanche** | $0.20 | Moderate cost |
| **Base** | $0.0001 - $0.001 | Extremely low gas fees |

**Conclusion:** The $0.25 USDC price is highly competitive and user-friendly, especially on Base, where gas fees are negligible.

---

## 4. AI Image Generation (DALL-E 3)

### API Pricing

| Resolution | Quality | Cost per Image |
| :--- | :--- | :--- |
| 1024x1024 | Standard | $0.04 |
| 1024x1792 | Standard | $0.08 |
| 1024x1024 | HD | $0.08 |
| 1024x1792 | HD | $0.12 |

**Recommendation:** Use **1024x1024 Standard** for the MVP to minimize costs while maintaining quality.

### Integration Method

The DALL-E 3 API is accessed via the OpenAI API. The integration will be implemented in the backend (Next.js API route or Express.js endpoint) to keep the API key secure.

**Example Implementation:**

```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await openai.images.generate({
  model: "dall-e-3",
  prompt: "A Pixar-style portrait of a golden retriever with a blue border",
  n: 1,
  size: "1024x1024",
  quality: "standard",
});

const imageUrl = response.data[0].url;
```

### Prompt Engineering for Pixar Style

To achieve the "Pixar theme," the prompt will include:

*   **Style keywords:** "Pixar-style," "3D animated," "cartoon," "vibrant colors"
*   **Pet description:** Species, breed, color, and any unique features
*   **Border:** "with a blue border matching the Base app color (#0052FF)"

**Example Prompt:**

```
A Pixar-style 3D animated portrait of a golden retriever with vibrant colors and a blue border (#0052FF). The dog has a friendly expression and is sitting on a white background.
```

---

## 5. NFT Smart Contract (ERC-721)

### Contract Requirements

*   **Standard:** ERC-721 (non-fungible token)
*   **Network:** Base (mainnet) and Base-Sepolia (testnet)
*   **Features:**
    *   Mint function (restricted to the backend wallet)
    *   Token metadata (name, description, image URL)
    *   Owner tracking
    *   Gas-efficient implementation

### Deployment Strategy

1.  **Testnet Deployment:** Deploy to Base-Sepolia for testing
2.  **Mainnet Deployment:** Deploy to Base mainnet for production

### Metadata Structure

Each NFT will have metadata stored on IPFS or a centralized server (for MVP simplicity):

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

---

## 6. Database Schema

### Tables

#### `pets`

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | int (PK) | Auto-incremented pet ID |
| `userId` | int (FK) | Owner's user ID |
| `name` | varchar(100) | Pet's name |
| `species` | varchar(50) | Dog, Cat, Bird, etc. |
| `breed` | varchar(100) | Breed (optional) |
| `personality` | text | Personality traits |
| `likes` | text | Things the pet likes |
| `dislikes` | text | Things the pet dislikes |
| `originalImageUrl` | varchar(500) | Original uploaded photo URL |
| `pfpImageUrl` | varchar(500) | AI-generated PFP URL |
| `nftTokenId` | int | Token ID from smart contract |
| `nftContractAddress` | varchar(42) | Smart contract address |
| `voteCount` | int | Total votes received |
| `createdAt` | timestamp | Creation timestamp |

#### `votes`

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | int (PK) | Auto-incremented vote ID |
| `userId` | int (FK) | Voter's user ID |
| `petId` | int (FK) | Pet being voted on |
| `createdAt` | timestamp | Vote timestamp |

**Constraint:** Unique index on `(userId, petId)` to prevent duplicate votes.

---

## 7. User Flow

### Step-by-Step User Journey

1.  **Landing Page:** User sees the PetsOfBase homepage with featured pets and leaderboard preview
2.  **Connect Wallet:** User connects their Base wallet (via Base app)
3.  **Upload Pet Photo:** User uploads a photo of their pet
4.  **Fill Info Card:** User enters pet name, species, breed, personality, likes, and dislikes
5.  **Generate PFP:** User selects a style (Pixar, Cartoon, etc.) and generates the AI PFP
6.  **Preview:** User previews the generated PFP with the blue border
7.  **Pay & Mint:** User clicks "Mint NFT" → X402 payment flow → $0.25 USDC charged → NFT minted
8.  **Confirmation:** User receives confirmation and can view their pet on the leaderboard
9.  **Vote:** User can vote on other pets to help them climb the leaderboard
10. **Share:** User shares their pet PFP on social media to drive virality

---

## 8. Technical Architecture

### Frontend

*   **Framework:** React 19 + Tailwind 4
*   **Routing:** Wouter
*   **State Management:** tRPC + React Query
*   **UI Components:** shadcn/ui

### Backend

*   **Framework:** Express 4 + tRPC 11
*   **Database:** MySQL (via Drizzle ORM)
*   **File Storage:** S3 (via Manus built-in storage)
*   **Authentication:** Manus OAuth

### External Services

*   **AI Generation:** OpenAI DALL-E 3 API
*   **Payment:** X402 Protocol
*   **Blockchain:** Base (EVM-compatible)
*   **NFT Contract:** Custom ERC-721 deployed on Base

---

## 9. Next Steps

1.  **Phase 2:** Initialize and scaffold the Base Mini-App project ✅ (Complete)
2.  **Phase 3:** Design and implement the frontend UI/UX for pet upload and info card
3.  **Phase 4:** Implement pet image upload, AI image generation, and NFT metadata logic
4.  **Phase 5:** Integrate X402 payment protocol for USDC fee collection
5.  **Phase 6:** Develop and deploy the ERC-721 smart contract for pet PFP NFTs
6.  **Phase 7:** Implement leaderboard, voting, and pet info card features
7.  **Phase 8:** Test and refine the mini-app functionality and user experience
8.  **Phase 9:** Prepare and deliver the final mini-app code and deployment instructions

---

## References

*   **Base Mini-App Quickstart:** [https://docs.base.org/mini-apps/quickstart/create-new-miniapp](https://docs.base.org/mini-apps/quickstart/create-new-miniapp)
*   **Base Mini-App Success Factors:** [https://docs.base.org/mini-apps/quickstart/building-for-the-base-app](https://docs.base.org/mini-apps/quickstart/building-for-the-base-app)
*   **X402 Protocol Website:** [https://www.x402.org/](https://www.x402.org/)
*   **X402 GitHub Repository:** [https://github.com/coinbase/x402](https://github.com/coinbase/x402)
*   **OpenAI DALL-E 3 Pricing:** [https://openai.com/api/pricing/](https://openai.com/api/pricing/)
