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

### Supabase setup (Storage + Postgres)

#### 1) Create a Supabase project

- Create a project in Supabase.
- Copy your **Postgres connection string** for Vercel (`DATABASE_URL`).

#### 2) Create the Storage bucket

This app expects a bucket named:

- `pet-images`

Uploads are done server-side using the **Service Role** key. The returned URLs are public URLs from Supabase Storage.

#### 3) Apply database migrations (Drizzle → Supabase)

The Postgres migration SQL is in:

- `drizzle/0000_majestic_joshua_kane.sql`

Apply it using **Supabase SQL Editor**:

1. Supabase Dashboard → **SQL Editor**
2. Create a new query
3. Paste the contents of `drizzle/0000_majestic_joshua_kane.sql`
4. Run it

If you already have tables, review the SQL before running (it contains `CREATE TABLE` and enum `CREATE TYPE`).

### Testing in Base dev / preview

1. Ensure Vercel **Deployment Protection is OFF** (Base needs to fetch your manifest + assets).
2. Confirm the manifest is reachable:
   - `https://<your-domain>/.well-known/farcaster.json`
3. Use Base’s preview tooling:
   - Go to `https://base.dev/preview`
   - Enter your deployed URL
4. For protected actions (upload/generate/mint), open inside Base so **Context + Quick Auth** are available.

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
