import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "./env";

const genAI = new GoogleGenerativeAI(ENV.geminiApiKey);

export interface GeminiImageGenerationParams {
  prompt: string;
  imageBase64: string;
  mimeType: string;
}

export interface GeminiImageGenerationResult {
  imageBase64: string;
  mimeType: string;
}

/**
 * Generate an image using Gemini 2.0 Flash Image (Nano Banana)
 * 
 * @param params - Generation parameters
 * @returns Generated image as base64
 */
export async function generateImageWithGemini(
  params: GeminiImageGenerationParams
): Promise<GeminiImageGenerationResult> {
  const { prompt, imageBase64, mimeType } = params;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
  });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      // @ts-ignore: imageConfig is allowed in image models
      imageConfig: {
        aspectRatio: "1:1",
      },
    },
  });

  const candidates = result.response?.candidates || [];
  const parts = candidates[0]?.content?.parts || [];

  // Debug logging
  console.log("[Gemini Debug] Response structure:", JSON.stringify({
    candidatesCount: candidates.length,
    firstCandidatePartsCount: parts.length,
    partTypes: parts.map((p: any) => Object.keys(p)),
  }, null, 2));

  // Find first inlineData part (the generated image)
  const imagePart = parts.find(
    (p: any) => p.inlineData && p.inlineData.data
  );

  if (!imagePart) {
    console.error("[Gemini Debug] Full response:", JSON.stringify(result.response, null, 2));
    throw new Error("No image returned from Gemini");
  }

  const outBase64 = imagePart.inlineData?.data as string;

  return {
    imageBase64: outBase64,
    mimeType: imagePart.inlineData?.mimeType || mimeType,
  };
}
