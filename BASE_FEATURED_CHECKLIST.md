# Base Featured Guidelines Checklist for PetsOfBase

## ✅ COMPLETED

### Authentication
- [x] In-app authentication stays within Base app (using Manus OAuth + Farcaster Context API)
- [x] Wallet connection happens automatically
- [x] No email or phone verification inside the app

### Onboarding Flow
- [x] Clear purpose explanation on home page
- [x] App only requests essential information
- [x] Display user's avatar and username (via Farcaster Context API)
- [x] No 0x addresses shown

### Layout
- [x] CTAs visible and centered on page
- [x] Clear navigation with top nav bar
- [x] All buttons accessible and not cut off
- [x] Navigation items have clear labels

### Load Time
- [x] Loading indicators shown during actions (spinners, skeletons)

### App Metadata
- [x] App icon is 1024×1024 PNG (PetsOnBase1024x1024.png)
- [x] Hero image 1200×630px created
- [x] 3 screenshots (1284×2778px portrait) created
- [x] OG image 1200×630px created
- [x] Clear, concise app description

### User Profile
- [x] Show user's Farcaster avatar and username
- [x] No 0x addresses displayed

### Design - Colors
- [x] Primary brand color (blue) for CTAs
- [x] Neutral colors for text and backgrounds
- [x] Good contrast maintained

### Design - Typography
- [x] Easy to read fonts (system fonts)
- [x] Sufficient contrast between text and background

### Design - Spacing
- [x] Consistent spacing throughout
- [x] White space for breathing room

### Technical - Metadata
- [x] Manifest file created at /.well-known/farcaster.json
- [x] Required fields present (accountAssociation, frame, etc.)
- [x] Images meet size/format constraints

### Technical - Client-Agnostic
- [x] No Farcaster-specific hardcoded text
- [x] Neutral language in UI

---

## ⚠️ NEEDS IMPLEMENTATION

### Base Compatibility
- [ ] **CRITICAL: Transactions must be sponsored** (currently not implemented)
  - Need to integrate Base Paymaster
  - Claim free gas credits on base.dev
  - Remove payment requirements for minting/regeneration

### Usability
- [ ] **App must support light AND dark modes** (currently only dark mode)
  - Implement theme toggle
  - Maintain contrast in both modes
  - Respect system preference

- [ ] **Minimum 44px touch targets** (need to verify all buttons)
  - Audit all interactive elements
  - Ensure mobile-friendly touch targets

### Layout
- [ ] **Bottom navigation bar recommended** (currently using top nav)
  - Consider adding bottom nav for mobile
  - Or keep top nav if it works well on mobile

### Load Time
- [ ] **App must load within 3 seconds** (need to test)
  - Test actual load time in Base app
  - Optimize if needed

- [ ] **In-app actions must complete within 1 second** (need to test)
  - Test image generation speed
  - Test voting/like actions
  - Optimize if needed

### Onboarding Flow
- [ ] **Add onboarding screens** (currently no first-time user flow)
  - Create 1-3 screen onboarding explaining:
    - What PetsOfBase does
    - How to upload a pet
    - How to mint NFT
    - How voting works

### Navigation
- [ ] **Consider side menu** for settings and user profile
  - Could improve UX for accessing profile/settings

### Technical - Sponsored Transactions
- [ ] **Integrate Base Paymaster** for sponsored transactions
  - Follow Base Paymaster guide
  - Claim gas credits
  - Remove $0.25 USDC payment requirement

### Technical - Batch Transactions
- [ ] **Batch sequential actions** where applicable
  - Use EIP-5792 for multiple calls
  - Example: approve + mint in one transaction

### Technical - Manifest Validation
- [ ] **Validate manifest** at base.dev/preview
  - Test after deployment
  - Ensure all fields are correct

### Technical - Account Association
- [ ] **Sign manifest** with wallet to prove domain ownership
  - Do this in Base Build dashboard after deployment

---

## 📋 PRIORITY ORDER

### HIGH PRIORITY (Required for Featured)
1. **Sponsored Transactions** - This is critical, currently charging $0.25 USDC
2. **Light/Dark Mode Support** - Required for featured placement
3. **Onboarding Flow** - First-time user experience
4. **Touch Target Sizes** - Verify all buttons are 44px+
5. **Load Time Testing** - Ensure <3s load, <1s actions

### MEDIUM PRIORITY (Recommended)
6. **Bottom Navigation** - Better mobile UX
7. **Batch Transactions** - Reduce friction
8. **Side Menu** - Better settings access

### LOW PRIORITY (Polish)
9. **Manifest Validation** - Test at base.dev/preview
10. **Account Association** - Sign manifest after deployment

---

## 🚀 IMPLEMENTATION PLAN

### Phase 1: Critical Requirements
1. Implement light/dark mode toggle
2. Integrate Base Paymaster for sponsored transactions
3. Create onboarding flow (3 screens max)
4. Audit and fix touch target sizes

### Phase 2: Testing & Optimization
5. Test load times and optimize
6. Test action completion times
7. Validate manifest at base.dev/preview

### Phase 3: Polish
8. Consider bottom navigation
9. Add side menu if needed
10. Implement batch transactions
11. Sign manifest in Base Build

---

## 📝 NOTES

**Strengths:**
- Farcaster profile integration is excellent
- Clean, modern design
- Good use of loading states
- Clear CTAs and navigation

**Weaknesses:**
- No sponsored transactions (major blocker)
- Only dark mode (required for featured)
- No onboarding flow
- Need to verify touch targets
- Need to test performance

**Next Steps:**
1. Start with sponsored transactions (biggest blocker)
2. Add light mode support
3. Create simple onboarding
4. Test and optimize performance
5. Deploy and validate manifest
