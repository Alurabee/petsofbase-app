import { paymentMiddleware } from "x402-express";

/**
 * X402 Payment Configuration
 * 
 * This middleware protects the NFT minting endpoint with a $0.25 USDC payment requirement.
 * When a client tries to access the protected endpoint without payment, the server responds
 * with HTTP 402 Payment Required. The Base app wallet handles the payment and retries.
 */

// Payment recipient address (should be set via environment variable)
const PAYMENT_RECIPIENT_ADDRESS = (process.env.PAYMENT_RECIPIENT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

if (PAYMENT_RECIPIENT_ADDRESS === "0x0000000000000000000000000000000000000000") {
  console.warn("[X402] WARNING: PAYMENT_RECIPIENT_ADDRESS not configured. Payments will fail.");
  console.warn("[X402] Please set PAYMENT_RECIPIENT_ADDRESS in your environment variables.");
}

/**
 * X402 Payment Middleware
 * 
 * Routes and their payment requirements:
 * - /api/mint-nft: $0.25 USDC per mint
 */
export const x402Middleware = paymentMiddleware(
  PAYMENT_RECIPIENT_ADDRESS,
  {
    "/api/mint-nft": "$0.25", // $0.25 USDC per NFT mint
  }
);

/**
 * Payment configuration details
 */
export const PAYMENT_CONFIG = {
  recipientAddress: PAYMENT_RECIPIENT_ADDRESS,
  mintPrice: "$0.25",
  currency: "USDC",
  network: "base", // Base mainnet
  testnetNetwork: "base-sepolia", // Base Sepolia testnet
};

/**
 * Check if X402 payment is properly configured
 */
export function checkX402Configuration(): boolean {
  if (PAYMENT_RECIPIENT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    console.error("[X402] Payment recipient address not configured");
    return false;
  }

  console.log("[X402] Payment configuration:");
  console.log("[X402]   Recipient:", PAYMENT_RECIPIENT_ADDRESS);
  console.log("[X402]   Mint price:", PAYMENT_CONFIG.mintPrice);
  console.log("[X402]   Currency:", PAYMENT_CONFIG.currency);
  console.log("[X402]   Network:", PAYMENT_CONFIG.network);

  return true;
}
