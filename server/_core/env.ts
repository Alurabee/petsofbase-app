export const ENV = {
  // Database
  databaseUrl: process.env.DATABASE_URL ?? process.env.SUPABASE_POSTGRES_URL ?? "",
  
  // Supabase
  supabaseUrl: process.env.VITE_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  
  // AI Image Generation (Replicate)
  replicateApiToken: process.env.REPLICATE_API_TOKEN ?? "",
  
  // JWT for sessions
  cookieSecret: process.env.JWT_SECRET ?? "change-me-in-production",
  
  // Environment
  isProduction: process.env.NODE_ENV === "production",
  
  // App metadata
  appUrl: process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : process.env.APP_URL ?? "http://localhost:3000",
};
