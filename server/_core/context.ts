import type { Request, Response } from "express";

export type User = {
  id: number;
  openId: string;
  name: string;
  pfpUrl: string | null;
  email: string | null;
  role: "admin" | "user";
};

export type Context = {
  req: Request;
  res: Response;
  user: User | null;
};

export async function createContext({ req, res }: { req: Request; res: Response }): Promise<Context> {
  // TODO: Implement OnchainKit/Farcaster auth
  // For now, return null user (guest mode)
  return {
    req,
    res,
    user: null,
  };
}
