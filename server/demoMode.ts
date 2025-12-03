/**
 * Demo Mode Configuration
 * 
 * Allows testing the complete app flow without requiring actual payments or deployed contracts.
 * Enable this for development and testing, disable for production.
 */

// Enable demo mode via environment variable
export const DEMO_MODE = process.env.DEMO_MODE === "true" || process.env.NODE_ENV === "development";

/**
 * Simulate NFT minting for demo purposes
 */
export function simulateMint(petId: number): {
  success: boolean;
  tokenId?: number;
  contractAddress?: string;
  transactionHash?: string;
  error?: string;
} {
  if (!DEMO_MODE) {
    throw new Error("Demo mode is not enabled");
  }

  // Generate fake but realistic-looking values
  const tokenId = Math.floor(Math.random() * 10000) + 1;
  const contractAddress = "0x" + Array.from({ length: 40 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
  const transactionHash = "0x" + Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join("");

  console.log(`[Demo Mode] Simulated mint for pet ${petId}:`, {
    tokenId,
    contractAddress,
    transactionHash,
  });

  return {
    success: true,
    tokenId,
    contractAddress,
    transactionHash,
    error: undefined,
  };
}

/**
 * Check if demo mode is active
 */
export function isDemoMode(): boolean {
  return DEMO_MODE;
}

/**
 * Get demo mode status message
 */
export function getDemoModeMessage(): string {
  return DEMO_MODE
    ? "Demo mode is active. Payments and minting are simulated."
    : "Production mode. Real payments and minting required.";
}
