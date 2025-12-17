import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";

/**
 * Vercel catch-all handler for tRPC.
 *
 * tRPC's httpBatchLink calls `/api/trpc/<procedurePath>`, so we must have a
 * catch-all route to match `/api/trpc/*` in production (similar to Express wildcard).
 */
export default async function handler(req: any, res: any) {
  // Derive the tRPC path from the incoming URL.
  // Examples:
  // - /api/trpc/imageValidation.validatePetImageBase64?batch=1
  // - /api/trpc/pets.uploadImage?batch=1
  let path = "";
  try {
    const u = new URL(String(req?.url ?? ""), "http://localhost");
    const prefix = "/api/trpc/";
    if (u.pathname.startsWith(prefix)) {
      path = decodeURIComponent(u.pathname.slice(prefix.length));
    } else {
      const parts = u.pathname.split("/").filter(Boolean);
      path = parts[parts.length - 1] ?? "";
    }
  } catch {
    path = "";
  }

  return nodeHTTPRequestHandler({
    req,
    res,
    path,
    router: appRouter,
    createContext,
    maxBodySize: 10 * 1024 * 1024, // 10MB
  });
}

