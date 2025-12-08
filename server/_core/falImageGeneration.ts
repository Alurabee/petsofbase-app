import { fal } from "@fal-ai/client";
import { ENV } from "./env";

// Configure fal.ai client
fal.config({
  credentials: ENV.falKey,
});

type AspectRatio = "1:1" | "21:9" | "4:3" | "3:2" | "2:3" | "5:4" | "4:5" | "3:4" | "16:9" | "9:16";

export interface FalImageGenerationParams {
  prompt: string;
  imageUrl: string;
  aspectRatio?: AspectRatio;
  outputFormat?: "jpeg" | "png" | "webp";
}

export interface FalImageGenerationResult {
  url: string;
  contentType: string;
  fileName: string;
  description: string;
}

/**
 * Generate an image using fal.ai Gemini 2.5 Flash Image (Nano Banana)
 * 
 * @param params - Generation parameters
 * @returns Generated image URL and metadata
 */
export async function generateImageWithFal(
  params: FalImageGenerationParams
): Promise<FalImageGenerationResult> {
  const { prompt, imageUrl, aspectRatio = "1:1" as AspectRatio, outputFormat = "png" } = params;

  console.log("[fal.ai] Generating image with Nano Banana...");
  console.log("[fal.ai] Prompt:", prompt.substring(0, 100) + "...");

  const result = await fal.subscribe("fal-ai/gemini-25-flash-image/edit", {
    input: {
      prompt,
      image_urls: [imageUrl],
      num_images: 1,
      aspect_ratio: aspectRatio,
      output_format: outputFormat,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === "IN_PROGRESS") {
        update.logs?.map((log) => log.message).forEach((msg) => {
          console.log("[fal.ai]", msg);
        });
      }
    },
  });

  if (!result.data?.images || result.data.images.length === 0) {
    throw new Error("No image returned from fal.ai");
  }

  const image = result.data.images[0];

  console.log("[fal.ai] Image generated successfully:", image.url);

  return {
    url: image.url,
    contentType: image.content_type || "image/png",
    fileName: image.file_name || "generated.png",
    description: result.data.description || "",
  };
}
