import express from "express";
import { paymentMiddleware } from "x402-express";
import { isDemoMode, simulateMint } from "../server/demoMode";
import { generateNFTMetadata, mintPetNFT } from "../server/nftMinting";
import { getPetById, updatePet } from "../server/db";
import { storagePut } from "../server/storage";
import { verifyAuthHeader } from "../server/_core/quickAuth";

const app = express();
app.use(express.json({ limit: "50mb" }));

const PAYMENT_RECIPIENT_ADDRESS =
  (process.env.PAYMENT_RECIPIENT_ADDRESS ||
    "0x0000000000000000000000000000000000000000") as `0x${string}`;

const mintPayment = paymentMiddleware(PAYMENT_RECIPIENT_ADDRESS, {
  "/": "$0.50",
});

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
  (req: any, res: any, next: any) => {
    // In demo mode we skip the payment challenge.
    if (isDemoMode()) return next();
    return mintPayment(req, res, next);
  },
  async (req: any, res: any) => {
    try {
      const { petId, walletAddress } = req.body || {};
      if (!petId || !walletAddress) {
        return res.status(400).json({ error: "Missing petId or walletAddress" });
      }

      const pet = await getPetById(Number(petId));
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }

      // Authorization: only the pet owner can mint.
      if (pet.ownerFid && req.auth?.fid && pet.ownerFid !== req.auth.fid) {
        return res.status(403).json({ error: "Not your pet" });
      }

      if (!pet.pfpImageUrl) {
        return res.status(400).json({ error: "Pet does not have a generated PFP" });
      }

      if (pet.nftTokenId) {
        return res.status(400).json({ error: "Pet already minted as NFT" });
      }

      const metadata = generateNFTMetadata(pet, pet.pfpImageUrl);
      const metadataJson = JSON.stringify(metadata, null, 2);

      const metadataKey = `pets/${pet.userId}/${pet.id}/metadata.json`;
      const { url: metadataUri } = await storagePut(
        metadataKey,
        Buffer.from(metadataJson, "utf-8"),
        "application/json"
      );

      let mintResult;
      if (isDemoMode()) {
        mintResult = simulateMint(pet.id);
      } else {
        mintResult = await mintPetNFT({
          petId: pet.id,
          ownerAddress: walletAddress,
          metadataUri,
        });
      }

      if (!mintResult.success) {
        return res.status(500).json({ error: mintResult.error || "Failed to mint NFT" });
      }

      await updatePet(pet.id, {
        nftTokenId: mintResult.tokenId!,
        nftContractAddress: mintResult.contractAddress!,
        nftTransactionHash: mintResult.transactionHash!,
      });

      return res.json({
        success: true,
        tokenId: mintResult.tokenId,
        transactionHash: mintResult.transactionHash,
        contractAddress: mintResult.contractAddress,
        metadataUri,
      });
    } catch (error: any) {
      console.error("[Mint NFT] Error:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  }
);

export default function handler(req: any, res: any) {
  // Vercel passes the full path (e.g. "/api/mint-nft"). Our Express app is mounted at "/".
  // Normalize so route matching works in serverless.
  if (typeof req.url === "string") req.url = "/";
  return app(req, res);
}
