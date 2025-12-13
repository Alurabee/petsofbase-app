# PetsOfBase Deployment Notes

## Source: Base Documentation
https://docs.base.org/mini-apps/quickstart/create-new-miniapp

## Key Findings:

### Vercel Requirement
The Base documentation shows that their quickstart uses Vercel for deployment, but **Vercel is NOT a hard requirement**. It's just their recommended/easiest path.

### What You Actually Need:

1. **A Public Domain** - Any hosting platform that gives you a public URL works:
   - Vercel (recommended by Base)
   - Netlify
   - Railway
   - Render
   - AWS/GCP/Azure
   - Any hosting that serves your manifest publicly (Vercel is recommended)

2. **Manifest File** - Must be accessible at `https://your-domain/.well-known/farcaster.json`

3. **Account Association** - Sign the manifest using Base Build's Account Association tool

### Current approach (recommended)

Deploy on Vercel and ensure:
- `/.well-known/farcaster.json` is publicly accessible
- Vercel Deployment Protection is OFF

### What We Need to Do:

1. **Create manifest file** at `/public/.well-known/farcaster.json` (or `client/public/.well-known/farcaster.json` in our project structure)

2. **Generate image assets**:
   - Icon (1024×1024 PNG)
   - Splash screen (200×200px)
   - Hero image (1200×630px)
   - 3 screenshots (1284×2778px)
   - OG image (1200×630px)

3. **Deploy changes** so manifest is accessible at our public URL

4. **Use Base Build Account Association tool** to sign the manifest:
   - Go to https://www.base.dev (you're already logged in)
   - Navigate to Account Association tool
   - Paste our domain URL
   - Sign with wallet
   - Copy the generated accountAssociation fields back into manifest

5. **Important: Turn off Vercel Deployment Protection**:
   - The docs mention: "Ensure that Vercel's Deployment Protection is off by going to the Vercel dashboard for your project and navigating to Settings → Deployment Protection and toggling 'Vercel Authentication' to off and click save."
   - Base needs public access to your manifest and assets

### Deployment Options:

**Option A: Deploy to Vercel (recommended)**
- Import repo into Vercel
- Set env vars
- Deploy and validate via `base.dev/preview`

**Option B: Custom Domain**
- Buy domain (e.g., petsofbase.com)
- Point to Vercel hosting
- Create manifest with custom domain
- Sign and test

### Recommendation:
Start with **Vercel** to match Base’s docs and avoid private-access issues.
