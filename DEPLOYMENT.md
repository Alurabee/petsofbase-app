# PetsOfBase - GitHub & Vercel Deployment Guide

## Step 1: Download Project Files

Download all project files from the Manus Management UI:
1. Go to Management UI → Code panel
2. Click "Download All Files"
3. Extract the ZIP file to your local machine

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
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`

5. Add Environment Variables (copy from Manus Settings → Secrets):
   ```
   DATABASE_URL=<your-database-url>
   JWT_SECRET=<your-jwt-secret>
   VITE_APP_ID=<your-app-id>
   OAUTH_SERVER_URL=<oauth-server-url>
   VITE_OAUTH_PORTAL_URL=<oauth-portal-url>
   OWNER_OPEN_ID=<owner-open-id>
   OWNER_NAME=<owner-name>
   BUILT_IN_FORGE_API_URL=<forge-api-url>
   BUILT_IN_FORGE_API_KEY=<forge-api-key>
   VITE_FRONTEND_FORGE_API_KEY=<frontend-forge-api-key>
   VITE_FRONTEND_FORGE_API_URL=<frontend-forge-api-url>
   VITE_APP_LOGO=<app-logo-url>
   VITE_APP_TITLE=PetsOfBase
   VITE_ANALYTICS_ENDPOINT=<analytics-endpoint>
   VITE_ANALYTICS_WEBSITE_ID=<analytics-website-id>
   ```

6. Click "Deploy"

## Step 4: Update Manifest with Vercel URL

After deployment, you'll get a Vercel URL (e.g., `petsofbase.vercel.app`)

Update `client/public/.well-known/farcaster.json`:
- Replace all instances of `https://petsofbase.manus.space` with your Vercel URL
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
