# PetsOfBase Migration to External Services

## Goal
Migrate from Manus-hosted services to external alternatives for independent Vercel deployment as a Base Mini App.

## Migration Checklist

### Phase 1: Database Migration
- [ ] Set up Neon PostgreSQL database (free tier)
- [ ] Export current database schema
- [ ] Update DATABASE_URL environment variable
- [ ] Test database connection from Vercel

### Phase 2: Authentication Migration
- [ ] Replace Manus OAuth with Farcaster Auth Kit (Base-native auth)
- [ ] Install @farcaster/auth-kit package
- [ ] Update authentication flow in frontend
- [ ] Update authentication middleware in backend
- [ ] Test login/logout flow

### Phase 3: AI Image Generation Migration
- [ ] Choose external AI service (Replicate or OpenAI DALL-E)
- [ ] Get API key for chosen service
- [ ] Replace imageGeneration.ts with external API calls
- [ ] Update PFP generation endpoints
- [ ] Test image generation with all 5 styles

### Phase 4: File Storage Migration
- [ ] Set up Cloudinary or AWS S3 for image storage
- [ ] Get API credentials
- [ ] Update storage.ts with new storage provider
- [ ] Test image upload and retrieval

### Phase 5: Environment Variables
- [ ] Create .env.example file with all required variables
- [ ] Document how to get each API key/credential
- [ ] Add all variables to Vercel project settings
- [ ] Verify all services work in production

### Phase 6: Vercel Deployment
- [ ] Update vercel.json configuration
- [ ] Test build process locally
- [ ] Deploy to Vercel
- [ ] Verify all features work on production URL

### Phase 7: Base Mini App Integration
- [ ] Update manifest with production Vercel URL
- [ ] Generate account association
- [ ] Test at base.dev/preview
- [ ] Submit to Base app store

## External Services Needed

1. **Database**: Neon PostgreSQL (free tier: 0.5GB storage)
2. **Auth**: Farcaster Auth Kit (free, Base-native)
3. **AI Images**: Replicate (pay-per-use) or OpenAI DALL-E (pay-per-use)
4. **Storage**: Cloudinary (free tier: 25GB/month) or AWS S3
5. **Hosting**: Vercel (free tier: unlimited bandwidth)

## Estimated Costs (Monthly)
- Database: $0 (Neon free tier)
- Auth: $0 (Farcaster Auth Kit is free)
- AI Images: ~$0.50-2.00 per 100 generations (Replicate)
- Storage: $0 (Cloudinary free tier)
- Hosting: $0 (Vercel free tier)

**Total: ~$0-5/month depending on usage**
