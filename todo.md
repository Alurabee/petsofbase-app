# PetsOfBase TODO

## Base App Compatibility Verification

- [x] Audit badge system code for Manus-specific dependencies
- [x] Test badge awarding on vote
- [x] Test badge awarding on pet creation  
- [x] Verify database operations work correctly
- [x] Confirm all code uses standard Node.js/tRPC patterns
- [ ] Test on Vercel deployment (requires user to deploy)

## Zero-Cost Engagement System (Phase 1 - COMPLETED)

### Badge System
- [x] Create badge database schema (badges, userBadges tables)
- [x] Seed 14 initial badges (milestone, achievement, exclusive tiers)
- [x] Implement badge awarding logic (auto-award on votes, uploads, achievements)
- [x] Integrate badge checks into vote and pet creation flows

### Phase 2 - UI & Features (TODO)
- [x] Add badge display on pet cards
- [ ] Add badge display on user profiles
- [x] Create badge collection page
- [ ] Implement Pet of the Day selection (random from 5+ votes)
- [ ] Create featured pet banner on homepage
- [ ] Add daily shoutout to activity feed
- [ ] Add "Trending" section (most votes in 24h)
- [ ] Implement "Hall of Fame" (top 10 all-time)
- [ ] Add visual crown/trophy for top 3 on leaderboard
- [ ] Update How It Works page with new engagement features

## Pricing & Payments

- [ ] Update pricing: $0.50 USDC mint, $0.10 USDC regen
- [ ] Implement Base Pay for accepting payments
- [ ] Add payment confirmation UI
- [ ] Update How It Works page with pricing

## fal.ai Image Generation

- [x] Install @fal-ai/client package
- [x] Create fal.ai image generation helper
- [x] Test all 5 art styles (EXCELLENT results!)
- [x] Verify identity preservation quality

## Previous Completed Work

- [x] Logo replacement and branding
- [x] Button hover effects
- [x] User profile integration with Farcaster
- [x] Light/dark mode theme toggle
- [x] Onboarding flow (3 screens)
- [x] Base app color scheme
- [x] Golden top 3 leaderboard styling
- [x] Upload page enhancements
- [x] Base Mini App manifest creation

## Content Updates for Badge System

- [x] Update onboarding screen 3: Remove weekly prizes, add badge perks
- [x] Update homepage "Compete & Win" section: Focus on badges and leaderboard
- [x] Update homepage "Own Your PFP" section: Remove $0.25 USDC pricing mention
- [x] Update hero subtitle: Remove "Completely free" text
- [x] Update How It Works page: Reflect badge system instead of prizes
- [x] Review all pages for pricing/prize inconsistencies
- [x] Update all $0.25 to $0.50 (Mint, MyPets, Referrals)
- [x] Remove weekly prize mentions from PetOfTheDay component

## PFP Generation Pricing Update

- [x] Change FREE_GENERATION_LIMIT from 2 to 1 in server/routers.ts
- [x] Update error messages to reflect "1 free generation"
- [x] Update MyPets.tsx toast messages (currently says "2 free generations")
- [x] Update Mint.tsx generation counters and messages
- [x] Update PetDetail.tsx generation counters and messages
- [x] Update Home.tsx pricing display
- [x] Update How It Works FAQ with correct pricing (1 free + $0.10 each)
