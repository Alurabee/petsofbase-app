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
  });
}
