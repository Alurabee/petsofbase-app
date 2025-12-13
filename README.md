## PetsOfBase (Base Mini App)

PetsOfBase is a Base mini app where users upload a pet photo, generate an AI PFP (image-to-image), and optionally mint it as an NFT on Base.

### Key features

- **AI image-to-image PFP generation**: fal.ai **Gemini 2.5 Flash Image edit** (`fal-ai/gemini-25-flash-image/edit`, “Nano Banana”).
- **Farcaster/Base mini app auth**: Context + **Quick Auth** (JWT) for protected actions.
- **Social loops**: voting, leaderboard, Pet of the Day, badges, referrals.
- **Minting + payments**: X402 payment-gated mint + regeneration endpoints.
- **Storage**: Supabase Storage for uploaded images + generated assets.
- **Database**: Supabase Postgres (via `DATABASE_URL`) using Drizzle.

### Pricing

- **First generation**: FREE
- **Regeneration**: **$0.10 USDC**
- **Mint to NFT**: **$0.50 USDC**

### Production manifest

The Base mini app manifest is served as a static file at:

- `/.well-known/farcaster.json`

Source file:
- `client/public/.well-known/farcaster.json`

### Local development

Install deps:

```bash
pnpm install
```

Run typecheck:

```bash
pnpm run check
```

Run dev server (Express + Vite middleware):

```bash
pnpm run dev
```

### Vercel deployment

This repo is configured to deploy the Vite SPA output from `dist/public`, plus Vercel serverless functions under `/api/*`.

- `vercel.json` rewrites keep `/api/*` and `/.well-known/*` from being swallowed by the SPA rewrite.
- Serverless endpoints live in `api/` (tRPC + mint/regeneration helpers).

### Required environment variables

#### Core

- **`APP_DOMAIN`**: production host without protocol (e.g. `petsofbase-app.vercel.app`) for Quick Auth verification
- **`FAL_KEY`**: fal.ai API key (required for image generation)

#### Database (Supabase Postgres)

- **`DATABASE_URL`**: Postgres connection string

#### Storage (Supabase Storage)

- **`STORAGE_SUPABASE_URL`**
- **`STORAGE_SUPABASE_SERVICE_ROLE_KEY`**

#### X402 payments

- **`PAYMENT_RECIPIENT_ADDRESS`**: wallet to receive USDC payments

#### NFT minting

- **`NFT_CONTRACT_ADDRESS`**
- **`NFT_MINTER_PRIVATE_KEY`**
- **`BASE_RPC_URL`** (optional; defaults to Base mainnet RPC)

#### Admin

- **`OWNER_FID`**: Farcaster FID that should be treated as admin (optional)

### Notes

- The mini app keeps **fal.ai Nano Banana edit** as the production image2image pipeline.
- The frontend obtains Quick Auth tokens and sends them as `Authorization: Bearer <token>` for protected requests.
