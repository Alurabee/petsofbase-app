import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { verifyAuthHeader } from "./quickAuth";

export type TrpcContext = {
  // Keep these as `any` to support both Express and Vercel node-http handlers.
  // The code only relies on headers/cookies and response cookie helpers when present.
  req: any;
  res: any;
  user: User | null;
};

export async function createContext(
  opts: { req: any; res: any }
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const authHeader = opts.req?.headers?.authorization ?? opts.req?.headers?.Authorization;
    if (typeof authHeader === "string" && authHeader.length > 0) {
      const { fid } = await verifyAuthHeader(authHeader);
      const openId = `fid:${fid}`;

      // Ensure user exists in DB (id is required for protected actions).
      await db.upsertUser({
        openId,
        name: `fid:${fid}`,
        loginMethod: "farcaster",
        lastSignedIn: new Date(),
      });

      user = (await db.getUserByOpenId(openId)) ?? null;
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
