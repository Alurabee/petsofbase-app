# PetsOfBase - GitHub & Vercel Deployment Guide (Base Mini App)

## Step 1: Download Project Files

This project is a Base mini app designed to deploy on Vercel with a static frontend + serverless `/api/*`.\n+Deploy by pushing to GitHub and importing into Vercel.

## Step 2: Push to GitHub

Open terminal in the extracted project folder and run:

```bash
# Navigate to the project folder
cd path/to/PetsOfBase

# Create a new repository on GitHub first at: https://github.com/new
# Name it: PetsOfBase

# Add the remote (replace with your actual repo URL)
git remote add origin https://github.com/Alurabee/PetsOfBase.git

# Push to GitHub
git push -u origin main
```

## Step 3: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click "Import Project"
3. Select your GitHub repository: `Alurabee/PetsOfBase`
4. Configure the project:
   - **Framework Preset**: Other
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `pnpm install`

5. Add Environment Variables (Vercel Project → Settings → Environment Variables):
   ```
   # Base mini app domain (no protocol)
   APP_DOMAIN=petsofbase-app.vercel.app

   # fal.ai (required for image-to-image generation)
   FAL_KEY=...

   # Supabase Postgres
   DATABASE_URL=postgres://...

   # Supabase Storage
   STORAGE_SUPABASE_URL=https://....
   STORAGE_SUPABASE_SERVICE_ROLE_KEY=...

   # X402 payments (recipient wallet)
   PAYMENT_RECIPIENT_ADDRESS=0x...

   # NFT minting (optional for demo mode)
   NFT_CONTRACT_ADDRESS=0x...
   NFT_MINTER_PRIVATE_KEY=...
   BASE_RPC_URL=https://...

   # Optional
   OWNER_FID=12345
   ```

6. Click "Deploy"

## Step 4: Update Manifest with Vercel URL

After deployment, you'll get a Vercel URL (e.g., `petsofbase.vercel.app`)

Update `client/public/.well-known/farcaster.json`:
- Replace all instances of the old placeholder domain with your Vercel URL
- Push changes to GitHub (Vercel will auto-deploy)

## Step 5: Generate Account Association

1. Go to [Base Build Account Association Tool](https://build.base.org/account-association)
2. Enter your Vercel URL (e.g., `petsofbase.vercel.app`)
3. Click "Submit" then "Verify"
4. Sign with your wallet to generate credentials
5. Copy the `accountAssociation` object (header, payload, signature)
6. Update `client/public/.well-known/farcaster.json` with these values
7. Also add your wallet address to `baseBuilder.ownerAddress`
8. Push changes to GitHub

## Step 6: Preview Your Mini App

1. Go to [base.dev/preview](https://base.dev/preview)
2. Enter your Vercel URL
3. Verify:
   - Embeds display correctly
   - Account association is valid
   - Metadata is complete

## Step 7: Publish to Base App

Create a post in the Base app with your Vercel URL to publish your mini app!

---

## Important Notes

- **Database**: Ensure your database is accessible from Vercel's servers
- **Environment Variables**: Double-check all env vars are set correctly
- **Deployment Protection**: Turn OFF Vercel Authentication in Settings → Deployment Protection
- **Domain**: You can add a custom domain in Vercel settings after deployment

## Troubleshooting

**Build fails**: Check that all environment variables are set
**Database connection fails**: Verify DATABASE_URL is correct and database allows external connections
**Manifest not found**: Ensure `.well-known` folder is in `client/public/`
**Account association fails**: Make sure you're using the correct wallet and domain
