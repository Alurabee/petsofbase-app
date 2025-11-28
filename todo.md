# PetsOfBase TODO

## Phase 1: Core Infrastructure & Setup
- [x] Research and document X402 payment protocol integration
- [x] Set up database schema for pets, votes, and leaderboard
- [x] Configure S3 storage for pet images (pre-configured in template)
- [x] Design and implement ERC-721 smart contract for Pet PFP NFTs

## Phase 2: Pet Upload & Profile Creation
- [x] Create pet upload form (image, name, personality traits, likes/dislikes)
- [x] Implement image upload to S3 with proper file handling
- [x] Create pet info card component with blue border styling
- [x] Store pet metadata in database

## Phase 3: AI Image Generation
- [x] Integrate DALL-E 3 API for Pixar-style pet image generation
- [x] Implement multiple style options for pet PFPs (Pixar, Cartoon, Realistic, Anime, Watercolor)
- [x] Create PFP preview and selection UI
- [x] Store generated PFP URLs in database

## Phase 4: X402 Payment Integration
- [x] Install and configure X402 payment middleware
- [x] Create protected API endpoint for NFT minting with $0.25 USDC fee
- [x] Implement payment verification flow
- [ ] Test payment flow on Base testnet (requires deployed contract)

## Phase 5: NFT Minting
- [ ] Deploy ERC-721 smart contract to Base testnet (requires user action)
- [x] Implement NFT minting logic in backend
- [x] Store NFT metadata (tokenId, contract address, owner)
- [x] Create minting confirmation UI

## Phase 6: Leaderboard & Voting
- [x] Create leaderboard database schema (votes, rankings)
- [x] Implement voting mechanism (one vote per user per pet)
- [x] Build leaderboard UI with sorting by votes
- [ ] Add real-time vote count updates

## Phase 7: Community Features
- [x] Display all pets in a gallery view
- [x] Implement pet profile pages with full info cards
- [ ] Add social sharing functionality
- [ ] Create "trending" and "new" pet filters

## Phase 8: Testing & Polish
- [ ] Write vitest tests for all tRPC procedures
- [ ] Test complete user flow (upload → generate → pay → mint → vote)
- [ ] Optimize image loading and performance
- [ ] Add error handling and user feedback
- [ ] Test on Base mainnet

## Phase 9: Base Mini-App Integration
- [ ] Configure minikit.config.ts with app metadata
- [ ] Create account association credentials
- [ ] Test app preview in Base app
- [ ] Prepare deployment to Vercel

## Phase 10: Launch Preparation
- [ ] Final security audit
- [ ] Set pricing to $0.25 USDC
- [ ] Create launch announcement content
- [ ] Deploy to production

## Bug Fixes & Improvements
- [x] Fix AI generation prompts to preserve pet's main features and appearance
- [x] Add demo/bypass mode for testing minting flow without payment
- [x] Allow users to mark pets as "minted" for testing purposes

## Additional Bug Fixes
- [x] Fix AI generation to create true artistic transformations instead of subtle edits
- [x] Switch from image editing mode to pure generation mode for stronger style application

## New Feature: Generation Limits
- [x] Add generationCount field to pets table schema
- [x] Track generation count per pet in database
- [x] Implement 2 free generations per pet limit
- [ ] Add X402 payment ($0.10 USDC) for 3rd+ generations (backend ready, needs payment endpoint)
- [x] Show generation counter in UI (e.g., "1/2 free generations remaining")
- [x] Update MyPets page to display generation limit status

## Bug Fix
- [x] Fix nested div inside p tag on Mint page (/mint/:id)

## New Features: Regeneration UX Improvements
- [x] Add "Try Different Style" button on Mint page
- [x] Show generation count and remaining free generations on Mint page
- [x] Create X402 payment endpoint for paid regenerations ($0.10 USDC)
- [x] Integrate X402 payment for 3rd+ generations
- [x] Handle payment flow in frontend for paid regenerations

## Bug Fix
- [x] Fix nested div inside p tag on MyPets page (/my-pets)

## Bug Fixes & Improvements
- [x] Fix AI prompts to prevent text/labels from appearing in generated images
- [x] Add "Try Different Style" button to Pet Detail page (not just Mint page)
- [x] Remove any mention of "border" or "color" from AI prompts to avoid text generation

## UX Improvement
- [x] Add "Try Different Style" button to My Pets page (currently only on Pet Detail page)
- [x] Show generation counter on My Pets page pet cards

## Bug Fix: AI Not Preserving Pet Appearance
- [x] Re-enable image-to-image generation to preserve pet's color and features
- [x] Update prompts to emphasize "preserve appearance, change style only"
- [x] Add explicit anti-text instructions while using original image as reference

## Homepage Redesign
- [x] Add before/after showcase section with user's dog transformation
- [x] Create style showcase grid displaying all 5 artistic styles
- [x] Update logo to be more fun and pet-themed
- [x] Add social proof section highlighting community engagement
- [x] Copy example images to project public folder

## Logo Design
- [x] Generate 4 logo options using AI
- [x] Present options to user for selection
- [x] Create paw print variations with Base blue square emphasis
- [x] Create glass aesthetic version of gradient paw logo
- [x] Implement glassmorphism logo in navigation and favicon

## Logo Update
- [x] Create flat 2D front-facing version of glassmorphism logo with transparent background
- [x] Replace current logo with new flat version
- [x] Fix logo background - ensure truly transparent (not black) for white navigation bar
- [x] Add mobile-responsive navigation with hamburger menu
- [x] Fix logo checkerboard pattern - replaced transparency with white background
- [x] Make logo perfectly square (1024x1024) for Base app requirements

## PFP Version History Feature
- [x] Add database schema to store all generated PFP versions (not just latest)
- [x] Create backend procedures to save and retrieve versions
- [x] Update generatePFP to save each version
- [x] Create "View Previous Versions" UI on pet detail pages
- [x] Add version selection functionality
- [x] Allow users to select which version to mint from history
- [x] Show generation timestamps and style info for each version
