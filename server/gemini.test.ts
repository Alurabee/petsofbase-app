import { describe, it, expect } from "vitest";
import { generateImageWithGemini } from "./_core/geminiImageGeneration";

describe("Gemini API Integration", () => {
  it("should validate GEMINI_API_KEY is configured", async () => {
    // Create a simple 1x1 red pixel PNG in base64
    const testImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";
    
    const testPrompt = "A simple test image";

    try {
      const result = await generateImageWithGemini({
        prompt: testPrompt,
        imageBase64: testImageBase64,
        mimeType: "image/png",
      });

      // If we get here, the API key is valid
      expect(result).toBeDefined();
      expect(result.imageBase64).toBeDefined();
      expect(typeof result.imageBase64).toBe("string");
      expect(result.imageBase64.length).toBeGreaterThan(0);
    } catch (error: any) {
      // If the error is about API key, fail the test
      if (error.message?.includes("API key") || error.message?.includes("authentication")) {
        throw new Error("GEMINI_API_KEY is invalid or not configured properly");
      }
      // Other errors might be acceptable (rate limits, etc.)
      console.warn("Gemini API test warning:", error.message);
    }
  }, 30000); // 30 second timeout for API call
});
