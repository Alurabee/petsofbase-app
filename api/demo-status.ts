export default function handler(_req: any, res: any) {
  // This endpoint must NEVER crash: it is used to debug prod env issues in Base Build.
  try {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");

    // IMPORTANT: Do not include any secret values here.
    const commitSha =
      process.env.VERCEL_GIT_COMMIT_SHA ??
      process.env.VERCEL_GITHUB_COMMIT_SHA ??
      process.env.GITHUB_SHA ??
      null;

    const demoMode = process.env.DEMO_MODE === "true" || process.env.NODE_ENV === "development";

    res.end(
      JSON.stringify({
        ok: true,
        demoMode,
        nodeEnv: process.env.NODE_ENV ?? null,
        vercelEnv: process.env.VERCEL_ENV ?? null,
        commitSha,
        hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY),
        hasFalKey: Boolean(process.env.FAL_KEY),
        storageSupabaseUrlSet: Boolean(process.env.STORAGE_SUPABASE_URL),
        storageServiceRoleKeySet: Boolean(process.env.STORAGE_SUPABASE_SERVICE_ROLE_KEY),
      })
    );
  } catch (err: any) {
    try {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          ok: false,
          error: String(err?.stack || err),
        })
      );
    } catch {
      // If even responding fails, swallow to avoid additional crashes.
    }
  }
}
