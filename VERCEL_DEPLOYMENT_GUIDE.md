# PetsOfBase - Vercel Deployment Guide

## 🎯 Overview
This guide walks you through deploying PetsOfBase to Vercel and completing the Base Build integration following Base's recommended workflow.

---

## ✅ Pre-Deployment Checklist

All assets and configuration files are ready:
- ✅ Vercel configuration (`vercel.json`)
- ✅ App icon (1024×1024 PNG)
- ✅ Splash screen (200×200px)
- ✅ Hero image (1200×630px)
- ✅ 3 screenshots (1284×2778px portrait)
- ✅ OG image (1200×630px)
- ✅ Manifest file (`/client/public/.well-known/farcaster.json`)

---

## 📋 Step-by-Step Deployment

### Step 1: Push Code to GitHub

**Option A: Create New GitHub Repository**

1. Go to https://github.com/new
2. Create a new repository named `petsofbase` (or your preferred name)
3. **DO NOT** initialize with README, .gitignore, or license
4. Copy the repository URL (e.g., `https://github.com/yourusername/petsofbase.git`)

5. In your local terminal, run:
```bash
cd /home/ubuntu/PetsOfBase
git init
git add .
git commit -m "Initial commit: PetsOfBase ready for Vercel deployment"
git branch -M main
git remote add github https://github.com/yourusername/petsofbase.git
git push -u github main
```

**Option B: Use your existing Git repo**
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push
```

---

### Step 2: Deploy to Vercel

1. **Go to Vercel**: https://vercel.com/login
   - Sign in with GitHub (recommended for easy integration)

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Select your GitHub repository (`petsofbase`)
   - Click "Import"

3. **Configure Build Settings**:
   - **Framework Preset**: Other (or leave as detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `pnpm install`

4. **Environment Variables** (Important!):
   Add the Base mini app env vars:
   - `APP_DOMAIN` (e.g. `petsofbase-app.vercel.app`)
   - `FAL_KEY` (required for image generation)
   - `DATABASE_URL` (Supabase Postgres)
   - `STORAGE_SUPABASE_URL`
   - `STORAGE_SUPABASE_SERVICE_ROLE_KEY`
   - `PAYMENT_RECIPIENT_ADDRESS`
   - `NFT_CONTRACT_ADDRESS` (if minting live)
   - `NFT_MINTER_PRIVATE_KEY` (if minting live)
   - `BASE_RPC_URL` (optional; defaults to Base mainnet)
   - `OWNER_FID` (optional admin)

   **How to add**: Settings → Environment Variables → Add each one

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-5 minutes for build to complete
   - You'll get a URL like: `https://petsofbase.vercel.app`

6. **Disable Deployment Protection** (Critical!):
   - Go to your project settings in Vercel
   - Navigate to: Settings → Deployment Protection
   - Toggle "Vercel Authentication" to **OFF**
   - Click "Save"
   - This allows Base to access your manifest file

---

### Step 3: Update Manifest with Vercel URL

1. **Get your Vercel URL** (e.g., `https://petsofbase.vercel.app`)

2. **Update the manifest file**:
   - Open `/client/public/.well-known/farcaster.json`
   - Replace ALL instances of `https://your-vercel-url.vercel.app` with your actual Vercel URL
   - Example:
     ```json
     "homeUrl": "https://petsofbase.vercel.app",
     "iconUrl": "https://petsofbase.vercel.app/icon-1024.png",
     ```

3. **Commit and push the update**:
   ```bash
   git add client/public/.well-known/farcaster.json
   git commit -m "Update manifest with Vercel URL"
   git push
   ```

4. **Vercel will auto-deploy** the update (takes ~2 minutes)

5. **Verify manifest is accessible**:
   - Open in browser: `https://petsofbase.vercel.app/.well-known/farcaster.json`
   - You should see the JSON manifest file
   - If you get 404, check that the file is in `client/public/.well-known/`

---

### Step 4: Sign Manifest with Base Build

1. **Go to Base Build**: https://www.base.dev/apps
   - You mentioned you're already logged in ✅

2. **Navigate to Account Association Tool**:
   - Look for "Account Association" or "Sign Manifest" option
   - Or go directly to: https://www.base.dev/account-association

3. **Enter your Vercel URL**:
   - Paste your domain: `petsofbase.vercel.app` (without https://)
   - Click "Submit"

4. **Connect Wallet**:
   - Click "Verify" or "Sign"
   - Connect your wallet (the one you want to own this app)
   - Sign the transaction (no gas fee, just signature)

5. **Copy the Generated Credentials**:
   - You'll see three fields generated:
     * `header`
     * `payload`
     * `signature`
   - Copy all three values

6. **Update Manifest with Credentials**:
   - Open `/client/public/.well-known/farcaster.json`
   - Paste the values into the `accountAssociation` object:
     ```json
     "accountAssociation": {
       "header": "eyJmaWQiOjkxNTIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgwMmVmNzkwRGQ3OTkzQTM1ZkQ4NDdDMDUzRURkQUU5NDBEMDU1NTk2In0",
       "payload": "eyJkb21haW4iOiJhcHAuZXhhbXBsZS5jb20ifQ",
       "signature": "MHgxMGQwZGU4ZGYwZDUwZTdmMGIxN2YxMTU2NDI1MjRmZTY0MTUyZGU4ZGU1MWU0MThiYjU4ZjVmZmQxYjRjNDBiNGVlZTRhNDcwNmVmNjhlMzQ0ZGQ5MDBkYmQyMmNlMmVlZGY5ZGQ0N2JlNWRmNzMwYzUxNjE4OWVjZDJjY2Y0MDFj"
     }
     ```
   - Also add your wallet address to `baseBuilder.ownerAddress`:
     ```json
     "baseBuilder": {
       "ownerAddress": "0xYourWalletAddress"
     }
     ```

7. **Commit and push**:
   ```bash
   git add client/public/.well-known/farcaster.json
   git commit -m "Add Base Build account association credentials"
   git push
   ```

8. **Wait for Vercel to deploy** (~2 minutes)

---

### Step 5: Test & Verify

1. **Verify Manifest**:
   - Open: `https://petsofbase.vercel.app/.well-known/farcaster.json`
   - Confirm all fields are filled (no empty strings)
   - Check that all image URLs work

2. **Test Image Assets**:
   - Icon: `https://petsofbase.vercel.app/icon-1024.png`
   - Splash: `https://petsofbase.vercel.app/base-assets/splash-200.png`
   - Hero: `https://petsofbase.vercel.app/base-assets/hero-1200x630.png`
   - Screenshots: `https://petsofbase.vercel.app/base-assets/screenshot-1.png` (and 2, 3)
   - OG: `https://petsofbase.vercel.app/base-assets/og-1200x630.png`

3. **Test the App**:
   - Visit: `https://petsofbase.vercel.app`
   - Verify homepage loads correctly
   - Test key features (upload, leaderboard, etc.)

---

### Step 6: Register in Base Build & Go Live

1. **Import to Base Build**:
   - Go to https://www.base.dev/apps
   - Click "Import App" or "Add App"
   - Enter your Vercel URL: `https://petsofbase.vercel.app`
   - Base will read your manifest and import the app

2. **Set noindex to false** (when ready for production):
   - Edit manifest: change `"noindex": true` to `"noindex": false`
   - This makes your app discoverable in Base search
   - Commit and push

3. **Share to Trigger Indexing**:
   - Share your app once in Farcaster or Base app
   - This triggers Base's indexing system
   - Your app will appear in search and categories

---

## 🎉 You're Live!

Your app is now:
- ✅ Deployed on Vercel with a public URL
- ✅ Registered with Base Build
- ✅ Signed and verified with your wallet
- ✅ Ready to appear in Base app discovery

---

## 🔧 Troubleshooting

### Manifest 404 Error
- Check file is at: `client/public/.well-known/farcaster.json`
- Verify Vercel build completed successfully
- Clear browser cache and try again

### Images Not Loading
- Verify files exist in `client/public/` directory
- Check Vercel build logs for errors
- Ensure file names match exactly in manifest

### Account Association Failed
- Make sure Deployment Protection is OFF in Vercel
- Try a different browser or clear cache
- Ensure you're using the correct wallet

### App Not Appearing in Base
- Verify `noindex` is set to `false`
- Share the app once to trigger indexing
- Wait 24 hours for indexing to complete

---

## 📚 Next Steps

1. **Monitor Analytics**: Check Base Build dashboard for user metrics
2. **Deploy Smart Contract**: If not already deployed, deploy NFT contract to Base mainnet
3. **Configure Payments**: Set up USDC payment addresses for minting/regeneration
4. **Custom Domain** (optional): Add custom domain in Vercel settings
5. **Optimize Performance**: Monitor Vercel analytics and optimize as needed

---

## 🆘 Need Help?

- **Base Documentation**: https://docs.base.org/mini-apps
- **Vercel Support**: https://vercel.com/support
- **Base Discord**: Join the Base community for help

---

**Good luck with your launch! 🚀**
