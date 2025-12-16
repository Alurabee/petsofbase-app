import { isDemoMode } from "../server/demoMode";

export default function handler(_req: any, res: any) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  // IMPORTANT: Do not include any secret values here.
  // This endpoint is used to verify deployment + env var presence in Base Build.
  const commitSha =
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.VERCEL_GITHUB_COMMIT_SHA ??
    process.env.GITHUB_SHA ??
    null;

  res.end(
    JSON.stringify({
      demoMode: isDemoMode(),
      nodeEnv: process.env.NODE_ENV ?? null,
      vercelEnv: process.env.VERCEL_ENV ?? null,
      commitSha,
      hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY),
      hasFalKey: Boolean(process.env.FAL_KEY),
      storageSupabaseUrlSet: Boolean(process.env.STORAGE_SUPABASE_URL),
      storageServiceRoleKeySet: Boolean(process.env.STORAGE_SUPABASE_SERVICE_ROLE_KEY),
    })
  );
}
