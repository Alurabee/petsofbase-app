# PetsOfBase TODO

## Logo Replacement
- [x] Copy new PetsOfBase logo to public folder
- [x] Update Navigation component to use new logo
- [x] Test logo displays correctly across all pages

## Button Hover Effects
- [x] Add smooth scale and glow hover animations to CSS
- [x] Apply hover effects to all primary buttons
- [x] Test hover effects across all pages

## Vercel Deployment & Base Build Integration
- [x] Check for Vercel configuration files (vercel.json)
- [x] Ensure build scripts are correct for Vercel
- [x] Generate app icon (1024×1024 PNG)
- [x] Generate splash screen (200×200px)
- [x] Generate hero image (1200×630px)
- [x] Generate 3 screenshots (1284×2778px portrait)
- [x] Generate OG image (1200×630px)
- [x] Create manifest file at /public/.well-known/farcaster.json
- [ ] Deploy to Vercel via GitHub
- [ ] Sign manifest using Base Build Account Association tool
- [ ] Update manifest with accountAssociation credentials
- [ ] Test manifest accessibility at Vercel URL
- [ ] Share app to trigger Base indexing

## User Profile Integration
- [x] Update pets table schema to store owner avatar and display name
- [x] Update backend procedures to return user info with pet data
- [x] Add user profile display to gallery cards (avatar + name)
- [x] Add user profile display to leaderboard entries (avatar + name)
- [x] Add user profile display to pet detail pages (owner section)
- [x] Test user profile display across all pages

## Base Context API Profile Integration
- [x] Install @farcaster/miniapp-sdk package
- [x] Update pets schema to store owner's Farcaster profile (fid, username, displayName, pfpUrl)
- [x] Create useBaseContext hook to access Context API user data
- [x] Update pet creation to store owner's profile from Context API
- [x] Create Avatar component for displaying profile pictures
- [x] Update Gallery cards to show avatar + username
- [x] Update Leaderboard entries to show avatar + username
- [x] Update Pet detail pages to show avatar + username
- [x] Test Context API profile display in Base app

## Database Migration Fix
- [x] Check current database schema for pets table
- [x] Apply pending migrations to add Farcaster profile columns
- [x] Verify all queries work correctly

## Base Featured Guidelines Implementation
- [ ] Integrate Base Paymaster for sponsored transactions (deferred until NFT contract deployed)
- [x] Remove $0.25 USDC payment requirement for minting
- [x] Remove payment requirement for regeneration
- [x] Implement light/dark mode theme toggle
- [x] Create ThemeProvider with system preference detection
- [x] Update all components to support both themes
- [x] Create onboarding flow (3 screens max)
- [x] Audit all buttons for 44px minimum touch targets
- [ ] Test app load time (<3 seconds required)
- [ ] Test action completion times (<1 second required)
- [ ] Optimize performance if needed

## Design Polish
- [x] Add iconic Base blue borders to all NFT/pet cards
- [x] Ensure consistent Base branding throughout
- [x] Audit all text colors for visibility in both light and dark modes
- [x] Replace hardcoded colors with semantic theme colors
- [x] Add visible borders to all text input fields
- [x] Fix navigation menu visibility in dark mode

## Subtitle Area Theme Fix
- [x] Fix Leaderboard page subtitle area background and text colors
- [x] Fix Gallery page subtitle area background and text colors
- [x] Fix all other pages with subtitle areas

## Card Visual Contrast Enhancement
- [x] Add orange/gradient borders to card components
- [x] Lighten card backgrounds in dark mode for better contrast
- [x] Update CSS variables for card styling
- [x] Test appearance in both light and dark modes
- [x] Ensure all cards have consistent visual treatment

## Mixed Border Colors
- [x] Change default Card border back to blue
- [x] Add orange border variant class for specific cards
- [x] Apply mixed blue/orange borders across different pages
- [x] Test visual variety in both themes

## Gradient Card Backgrounds
- [x] Add subtle gradient backgrounds to selected cards
- [x] Ensure gradients work in both light and dark modes
- [x] Test readability with gradient backgrounds

## Base App Color Scheme Update
- [x] Create blue-to-purple gradient utility class (like referral link box)
- [x] Create light pastel background classes (blue, pink, green for stat cards)
- [x] Create cream/beige background class for informational sections
- [x] Apply blue-purple gradient to Pet of the Day and Weekly Draw
- [x] Apply blue-purple gradient to featured content sections on homepage
- [x] Apply light pastel backgrounds to stat cards across all pages
- [x] Apply cream/beige to "How It Works" style sections
- [x] Ensure all text is readable on new background colors
- [x] Test color scheme in both light and dark modes

## Homepage Leaderboard Update
- [x] Change "Cuteness Leaderboard" to "Most Popular Pet Leaderboard"
- [x] Update leaderboard card styling to match My Pets page
- [x] Add square aspect ratio for pet images
- [x] Add Base blue border around images
- [x] Ensure images fit perfectly within borders

## Golden Top 3 Leaderboard Styling
- [x] Add yellow/gold border to top 3 leaderboard cards on homepage
- [x] Create gradient yellow utility class for trophy icon
- [x] Apply conditional styling based on rank (1-3 vs 4+)

## Upload Page Enhancements
- [x] Add gradient background to upload page
- [x] Add decorative floating pet emojis
- [x] Add encouraging microcopy with emojis
- [x] Enhance upload dropzone with hover effects
- [x] Make submit button more exciting with gradient styling
- [x] Add subtle animations to make page feel alive

## View All Button Styling
- [x] Update View All button to use subtle yellow gradient
- [x] Match darker gold color from numbered badges (#F59E0B)

## Hero Section View Leaderboard Button
- [x] Update View Leaderboard button to match View All golden gradient
- [x] Ensure consistent styling across both leaderboard CTA buttons
