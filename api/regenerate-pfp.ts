import express from "express";
import { paymentMiddleware } from "x402-express";
import { isDemoMode } from "../server/demoMode";
import { getPetById, updatePet, createPfpVersion } from "../server/db";
import { generatePetPFP } from "../server/imageGeneration";
import { verifyAuthHeader } from "../server/_core/quickAuth";

const app = express();
app.use(express.json({ limit: "50mb" }));

const PAYMENT_RECIPIENT_ADDRESS =
  (process.env.PAYMENT_RECIPIENT_ADDRESS ||
    "0x0000000000000000000000000000000000000000") as `0x${string}`;

const regenPayment = paymentMiddleware(PAYMENT_RECIPIENT_ADDRESS, {
  "/": "$0.10",
});

const FREE_GENERATION_LIMIT = 1; // align with repo docs: 1 free generation per pet

async function requireQuickAuthUser(req: any) {
  const authHeader = req.headers?.authorization;
  if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
    const err: any = new Error("Missing Authorization header");
    err.statusCode = 401;
    throw err;
  }

  const { fid } = await verifyAuthHeader(authHeader);
  return { fid, openId: `fid:${fid}` };
}

app.post(
  "/",
  async (req: any, res: any, next: any) => {
    try {
      req.auth = await requireQuickAuthUser(req);
      next();
    } catch (e: any) {
      res.status(e?.statusCode || 401).json({ error: e?.message || "Unauthorized" });
    }
  },
  async (req: any, res: any, next: any) => {
    try {
      if (isDemoMode()) return next();

      const { petId } = req.body || {};
      const pet = await getPetById(Number(petId));
      if (!pet) return res.status(404).json({ error: "Pet not found" });

      const currentCount = pet.generationCount || 0;
      const requiresPayment = currentCount >= FREE_GENERATION_LIMIT;
      if (!requiresPayment) return next();

      return regenPayment(req, res, next);
    } catch (e: any) {
      return res.status(500).json({ error: e?.message || "Internal server error" });
    }
  },
  async (req: any, res: any) => {
    try {
      const { petId, style } = req.body || {};
      if (!petId || !style) {
        return res.status(400).json({ error: "Missing petId or style" });
      }

      const pet = await getPetById(Number(petId));
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }

      // Authorization: only the pet owner can regenerate.
      if (pet.ownerFid && req.auth?.fid && pet.ownerFid !== req.auth.fid) {
        return res.status(403).json({ error: "Not your pet" });
      }

      const pfpImageUrl = await generatePetPFP({
        petName: pet.name,
        species: pet.species,
        breed: pet.breed || undefined,
        personality: pet.personality || undefined,
        style,
        originalImageUrl: pet.originalImageUrl,
      });

      const currentCount = pet.generationCount || 0;
      const newCount = currentCount + 1;

      const prompt = `${style} style ${pet.species}${pet.breed ? ` (${pet.breed})` : ""} with personality: ${pet.personality || "friendly"}`;
      await createPfpVersion({
        petId: pet.id,
        imageUrl: pfpImageUrl,
        prompt,
        isSelected: 1,
        generationNumber: newCount,
      });

      await updatePet(pet.id, { pfpImageUrl, generationCount: newCount });

      return res.json({
        success: true,
        pfpImageUrl,
        generationCount: newCount,
        remainingFreeGenerations: Math.max(0, FREE_GENERATION_LIMIT - newCount),
      });
    } catch (error: any) {
      console.error("[Regenerate PFP] Error:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  }
);

export default function handler(req: any, res: any) {
  // Vercel passes the full path (e.g. "/api/regenerate-pfp"). Our Express app is mounted at "/".
  // Normalize so route matching works in serverless.
  if (typeof req.url === "string") req.url = "/";
  return app(req, res);
}
