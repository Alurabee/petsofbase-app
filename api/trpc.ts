import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

export default async function handler(req: any, res: any) {
  // tRPC v11 httpBatchLink calls `/api/trpc/<procedurePath>[?batch=1]`
  // The node-http handler expects `path` to be the last URL segment (procedure path or batch paths).
  let path = "";
  try {
    const u = new URL(String(req?.url ?? ""), "http://localhost");
    const parts = u.pathname.split("/").filter(Boolean);
    path = parts[parts.length - 1] ?? "";
  } catch {
    path = "";
  }

  return nodeHTTPRequestHandler({
    req,
    res,
    path,
    router: appRouter,
    createContext,
    // Image uploads/validation send base64 in JSON; raise limit above default.
    // Vercel payload limit is higher, but tRPC node-http adapter defaults can be smaller.
    maxBodySize: 10 * 1024 * 1024, // 10MB
  });
}
