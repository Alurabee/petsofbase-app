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
   - **Manus hosting** (we're already deployed!)

2. **Manifest File** - Must be accessible at `https://your-domain/.well-known/farcaster.json`

3. **Account Association** - Sign the manifest using Base Build's Account Association tool

### Our Current Situation:

✅ **We already have a public domain** from Manus hosting:
- Dev server: `https://3000-i3378a7o0712f6xf07ipx-02d2c383.manus-asia.computer`
- This URL works for testing and initial setup

✅ **We have Base Build access** at https://www.base.dev/apps

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

5. **Important: Turn off Vercel Deployment Protection** (if using Vercel):
   - The docs mention: "Ensure that Vercel's Deployment Protection is off by going to the Vercel dashboard for your project and navigating to Settings → Deployment Protection and toggling 'Vercel Authentication' to off and click save."
   - This is only needed if using Vercel - not applicable to Manus hosting

### Deployment Options:

**Option A: Stay on Manus (Easiest)**
- Use current Manus URL for initial testing
- Create manifest with Manus URL
- Sign and test
- Later can add custom domain if needed

**Option B: Deploy to Vercel (Base's Recommended)**
- Connect GitHub repo to Vercel
- Deploy to Vercel (gets custom domain like petsofbase.vercel.app)
- Create manifest with Vercel URL
- Sign and test

**Option C: Custom Domain**
- Buy domain (e.g., petsofbase.com)
- Point to either Manus or Vercel hosting
- Create manifest with custom domain
- Sign and test

### Recommendation:
Start with **Option A** (Manus hosting) to get everything working, then optionally migrate to Vercel or custom domain later. The manifest can be updated anytime.
