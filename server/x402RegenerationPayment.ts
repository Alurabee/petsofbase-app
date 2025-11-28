import { ENV } from "./_core/env";

/**
 * X402 payment configuration for paid PFP regenerations
 * Charges $0.10 USDC for 3rd+ generations
 */

const REGENERATION_PRICE_USDC = "0.10"; // $0.10 USDC per regeneration

export function getRegenerationPaymentConfig() {
  const recipientAddress = process.env.PAYMENT_RECIPIENT_ADDRESS;

  if (!recipientAddress) {
    console.warn("[X402 Regeneration] PAYMENT_RECIPIENT_ADDRESS not configured");
    return null;
  }

  return {
    amount: REGENERATION_PRICE_USDC,
    currency: "USDC",
    recipient: recipientAddress,
    network: "base", // Base mainnet
    description: "Pet PFP Regeneration Fee",
  };
}

/**
 * Check if regeneration payment is configured
 */
export function isRegenerationPaymentConfigured(): boolean {
  return !!process.env.PAYMENT_RECIPIENT_ADDRESS;
}
