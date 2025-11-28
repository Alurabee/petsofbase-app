import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { x402Middleware, checkX402Configuration } from "../x402Payment";
import { mintPetNFT, generateNFTMetadata, checkNFTContractStatus } from "../nftMinting";
import { storagePut } from "../storage";
import { getPetById, updatePet } from "../db";
import { isDemoMode, simulateMint } from "../demoMode";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Check X402 and NFT configuration on startup
  checkX402Configuration();
  checkNFTContractStatus();

  // X402 Payment-protected NFT minting endpoint
  // In demo mode, skip payment middleware for testing
  const mintHandler = async (req: any, res: any) => {
    try {
      const { petId, walletAddress } = req.body;

      if (!petId || !walletAddress) {
        return res.status(400).json({ error: "Missing petId or walletAddress" });
      }

      // Get pet from database
      const pet = await getPetById(petId);
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }

      if (!pet.pfpImageUrl) {
        return res.status(400).json({ error: "Pet does not have a generated PFP" });
      }

      if (pet.nftTokenId) {
        return res.status(400).json({ error: "Pet already minted as NFT" });
      }

      // Generate NFT metadata
      const metadata = generateNFTMetadata(pet, pet.pfpImageUrl);
      const metadataJson = JSON.stringify(metadata, null, 2);

      // Upload metadata to S3
      const metadataKey = `pets/${pet.userId}/${pet.id}/metadata.json`;
      const { url: metadataUri } = await storagePut(
        metadataKey,
        Buffer.from(metadataJson, "utf-8"),
        "application/json"
      );

      // Mint NFT on Base (or simulate in demo mode)
      let mintResult;
      if (isDemoMode()) {
        console.log("[Demo Mode] Simulating NFT mint");
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

      // Update pet record with NFT data
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
  };

  // Demo status endpoint
  app.get("/api/demo-status", (req, res) => {
    res.json({ demoMode: isDemoMode() });
  });

  // Apply payment middleware only in production mode
  if (isDemoMode()) {
    console.log("[Demo Mode] Minting endpoint running WITHOUT payment protection");
    app.post("/api/mint-nft", mintHandler);
  } else {
    console.log("[Production Mode] Minting endpoint protected by X402 payment");
    app.post("/api/mint-nft", x402Middleware, mintHandler);
  }
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
