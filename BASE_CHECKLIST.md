# Base Mini App Build Checklist for PetsOfBase

## ✅ Completed Items

### 1. Register for Base Build
- [ ] Register app at Base Build portal
- [ ] Get Builder Rewards access
- [ ] Access Preview tool for testing

### 2. Authentication ✅
- [x] Base Account integration (OAuth ready)
- [x] Optional sign-in (users can browse before connecting)
- [x] Fast authentication flow
- [x] Authentication only required for onchain interactions

### 3. Manifest
- [ ] Create `/public/.well-known/farcaster.json`
- [ ] Fill required fields:
  - [ ] `accountAssociation` (header, payload, signature)
  - [ ] `baseBuilder.ownerAddress`
  - [ ] `miniapp.version` = "1"
  - [ ] `miniapp.name` = "PetsOfBase"
  - [ ] `miniapp.homeUrl` (production URL)
  - [ ] `miniapp.iconUrl` (1024×1024 PNG)
  - [ ] `miniapp.splashImageUrl` (200×200px)
  - [ ] `miniapp.splashBackgroundColor` (hex color)
  - [ ] `miniapp.primaryCategory` (e.g., "social" or "entertainment")
  - [ ] `miniapp.tags` (up to 5 tags)
  - [ ] `miniapp.subtitle` (max 30 chars)
  - [ ] `miniapp.description` (max 170 chars)
  - [ ] `miniapp.tagline` (max 30 chars)
  - [ ] `miniapp.heroImageUrl` (1200×630px)
  - [ ] `miniapp.screenshotUrls` (3 screenshots, 1284×2778px)
  - [ ] `miniapp.ogTitle` (max 30 chars)
  - [ ] `miniapp.ogDescription` (max 100 chars)
  - [ ] `miniapp.ogImageUrl` (1200×630px)
  - [ ] `miniapp.noindex` = true (for testing, false for production)
- [ ] Sign manifest using Base Build Account Association tool
- [ ] Verify manifest is accessible at `https://your-domain/.well-known/farcaster.json`

### 4. Embeds & Previews
- [ ] Create compelling Open Graph images
- [ ] Test preview appearance in feed
- [ ] Ensure clear launch button in embeds
- [ ] Verify images load correctly

### 5. Search & Discovery
- [ ] Set primary category
- [ ] Add relevant tags (max 5)
- [ ] Share app once to trigger indexing
- [ ] Verify all assets are valid and accessible

### 6. Sharing & Social Graph ✅
- [x] MiniKit social sharing integrated (useCompose hook)
- [x] Share to Feed after PFP generation
- [x] Share to Feed after NFT minting
- [x] Twitter/X sharing with referral codes
- [x] Referral system with viral incentives

### 7. Notifications
- [ ] Set up webhook endpoint (`miniapp.webhookUrl`)
- [ ] Implement notification handlers
- [ ] Test notification delivery
- [ ] Rate-limit notifications appropriately

### 8. UX Best Practices ✅
- [x] Mobile-first responsive design
- [x] Touch-friendly interactions
- [x] Clear primary actions (Upload Pet, Mint NFT)
- [x] Respect safe areas
- [x] Concise interfaces
- [x] Fast loading times

### 9. Build for Growth ✅
- [x] Viral features implemented:
  - [x] Referral system with rewards
  - [x] Social sharing (MiniKit + Twitter)
  - [x] Leaderboard competition
  - [x] Pet of the Day voting ritual
  - [x] Weekly $5 USDC prize draw
  - [x] Live activity feed
- [x] Onboarding optimized (browse before auth)
- [x] Clear value proposition on homepage

## 🚧 Missing/Incomplete Items

### Critical for Launch:
1. **Manifest File** - Need to create and configure farcaster.json
2. **Account Association** - Sign manifest with wallet
3. **Production Assets** - Generate proper sized images:
   - Icon (1024×1024 PNG)
   - Splash screen (200×200px)
   - Hero image (1200×630px)
   - Screenshots (3x 1284×2778px)
   - OG image (1200×630px)
4. **Base Build Registration** - Register app in portal
5. **Notifications** - Set up webhook endpoint (optional but recommended)

### Nice to Have:
1. **OnchainKit Integration** - Could enhance wallet UX
2. **Base Account Features** - Additional Base-specific features

## Next Steps Priority:

1. ✅ Generate all required image assets
2. ✅ Create manifest file with all fields
3. ✅ Register on Base Build
4. ✅ Sign manifest and get account association
5. ✅ Deploy to production domain
6. ✅ Test manifest accessibility
7. ✅ Share app to trigger indexing
8. ⚠️ Set up notifications (optional)

## Current Status:
- **Core Features**: ✅ Complete
- **Social/Viral Features**: ✅ Complete
- **UX/Design**: ✅ Complete
- **Base Integration**: 🚧 Needs manifest + registration
- **Production Ready**: 🚧 Needs manifest + assets + deployment
