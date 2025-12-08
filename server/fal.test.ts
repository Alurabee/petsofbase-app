import { describe, it, expect } from "vitest";
import { generateImageWithFal } from "./_core/falImageGeneration";

describe("fal.ai API Integration", () => {
  it("should validate FAL_KEY is configured", async () => {
    // Use a simple test image URL
    const testImageUrl = "https://files.manuscdn.com/user_upload_by_module/session_file/117699726/YPvGWzILozjyQUtF.jpg";
    
    const testPrompt = "A simple test: show the same dog but with a blue background";

    try {
      const result = await generateImageWithFal({
        prompt: testPrompt,
        imageUrl: testImageUrl,
        aspectRatio: "1:1",
        outputFormat: "png",
      });

      // If we get here, the API key is valid
      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
      expect(typeof result.url).toBe("string");
      expect(result.url.length).toBeGreaterThan(0);
      expect(result.url).toMatch(/^https?:\/\//);
      
      console.log("✅ fal.ai API test successful!");
      console.log("   Generated image URL:", result.url);
    } catch (error: any) {
      // If the error is about API key, fail the test
      if (error.message?.includes("API key") || 
          error.message?.includes("authentication") ||
          error.message?.includes("credentials") ||
          error.message?.includes("unauthorized")) {
        throw new Error("FAL_KEY is invalid or not configured properly");
      }
      // Other errors might be acceptable (rate limits, etc.)
      console.warn("fal.ai API test warning:", error.message);
      throw error;
    }
  }, 60000); // 60 second timeout for API call
});
