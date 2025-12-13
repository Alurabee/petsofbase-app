import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "./_core/env";

export interface ImageValidationResult {
  isValid: boolean;
  reason?: "human_face" | "no_animal" | "low_quality" | "inappropriate" | "valid";
  confidence: number;
  detectedSubject?: string;
  message?: string;
}

/**
 * Validate that an image contains a pet (domestic animal) and not a human face or inappropriate content
 */
export async function validatePetImage(imageUrl: string): Promise<ImageValidationResult> {
  try {
    // If no Gemini key is set, skip validation (uploads still work).
    if (!ENV.geminiApiKey) {
      return {
        isValid: true,
        reason: "valid",
        confidence: 0.5,
        detectedSubject: "validation_disabled",
        message: "Validation not configured, allowing upload",
      };
    }

    const res = await fetch(imageUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch image (${res.status} ${res.statusText})`);
    }
    const mimeType = res.headers.get("content-type") || "image/jpeg";
    const bytes = Buffer.from(await res.arrayBuffer());
    const imageBase64 = bytes.toString("base64");

    const genAI = new GoogleGenerativeAI(ENV.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an image validation system for a pet photo app.
Return ONLY valid JSON with this exact schema:
{
  "isValid": true/false,
  "reason": "human_face" | "no_animal" | "low_quality" | "inappropriate" | "valid",
  "confidence": 0.0-1.0,
  "detectedSubject": "short description of what you see",
  "message": "brief explanation"
}

Rules:
- ACCEPT if: clear photo of a domestic pet (dog, cat, rabbit, bird, hamster, guinea pig, ferret, etc.), pet is the main subject, wholesome content.
- REJECT if: human faces (even with pets), no animal visible, inappropriate/offensive, too blurry/low quality, wild animals.`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType, data: imageBase64 } },
          ],
        },
      ],
    });

    const text = result.response.text();
    const parsed = JSON.parse(text);
    return parsed as ImageValidationResult;
  } catch (error) {
    console.error("[Image Validation] Error:", error);
    // On error, allow the image through but log it
    return {
      isValid: true,
      reason: "valid",
      confidence: 0.5,
      detectedSubject: "validation_error",
      message: "Validation service unavailable, allowing upload"
    };
  }
}

/**
 * Get user-friendly error message based on validation reason
 */
export function getValidationErrorMessage(reason: string): { title: string; message: string; icon: string } {
  switch (reason) {
    case "human_face":
      return {
        icon: "🚫",
        title: "Human Face Detected",
        message: "We detected a human face in this image. PetsOfBase is designed for pet photos only. Please upload a clear photo of your pet (dog, cat, rabbit, bird, etc.)."
      };
    case "no_animal":
      return {
        icon: "🔍",
        title: "No Pet Detected",
        message: "We couldn't detect a pet in this image. Please upload a clear, well-lit photo showing your pet's face. Make sure your pet is the main subject of the photo."
      };
    case "low_quality":
      return {
        icon: "📸",
        title: "Image Quality Too Low",
        message: "This image is too blurry or low-resolution. Please upload a clearer photo (minimum 512x512 pixels) for best results."
      };
    case "inappropriate":
      return {
        icon: "⚠️",
        title: "Image Not Allowed",
        message: "This image violates our content policy. Please upload a wholesome photo of your pet."
      };
    default:
      return {
        icon: "❌",
        title: "Validation Failed",
        message: "We couldn't validate this image. Please try a different photo."
      };
  }
}
