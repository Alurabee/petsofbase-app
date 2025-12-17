import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

export default async function handler(req: any, res: any) {
  return nodeHTTPRequestHandler({
    req,
    res,
    path: "/api/trpc",
    router: appRouter,
    createContext,
    // Image uploads/validation send base64 in JSON; raise limit above default.
    // Vercel payload limit is higher, but tRPC node-http adapter defaults can be smaller.
    maxBodySize: 10 * 1024 * 1024, // 10MB
  });
}
