import { generateImage as generateImageCore } from "./_core/imageGeneration";

export type PetImageStyle = "pixar" | "cartoon" | "realistic" | "anime" | "watercolor";

interface GeneratePetPFPOptions {
  petName: string;
  species: string;
  breed?: string;
  personality?: string;
  style: PetImageStyle;
  originalImageUrl?: string;
}

const stylePrompts: Record<PetImageStyle, string> = {
  pixar: "Pixar-style 3D animated portrait with vibrant colors, expressive eyes, and a friendly appearance",
  cartoon: "Cute cartoon-style illustration with bold outlines and bright colors",
  realistic: "Photorealistic portrait with detailed fur texture and natural lighting",
  anime: "Anime-style portrait with large expressive eyes and stylized features",
  watercolor: "Soft watercolor painting style with gentle colors and artistic brush strokes",
};

/**
 * Generate a pet PFP using DALL-E 3 with a blue border matching the Base app color
 */
export async function generatePetPFP(options: GeneratePetPFPOptions): Promise<string> {
  const { petName, species, breed, personality, style, originalImageUrl } = options;

  // Build the prompt
  const styleDescription = stylePrompts[style];
  const breedInfo = breed ? ` ${breed}` : "";
  const personalityInfo = personality ? ` with a ${personality} expression` : "";

  let prompt = `${styleDescription} of a${breedInfo} ${species}${personalityInfo}. `;
  prompt += `The portrait should have a prominent blue border (#0052FF, Base app color) around the entire image. `;
  prompt += `The pet should be centered, facing forward, with a clean white or subtle gradient background. `;
  prompt += `Professional quality, suitable for a profile picture.`;

  console.log("[Image Generation] Generating PFP with prompt:", prompt);

  try {
    // If we have an original image, use it for editing (future enhancement)
    // For now, we'll just generate a new image based on the description
    const result = await generateImageCore({
      prompt,
      // originalImages can be used for image editing in the future
      // originalImages: originalImageUrl ? [{ url: originalImageUrl, mimeType: "image/jpeg" }] : undefined,
    });

    if (!result.url) {
      throw new Error("Image generation did not return a URL");
    }
    
    console.log("[Image Generation] Successfully generated PFP:", result.url);
    return result.url;
  } catch (error) {
    console.error("[Image Generation] Failed to generate PFP:", error);
    throw new Error("Failed to generate pet PFP. Please try again.");
  }
}

/**
 * Get available style options for the frontend
 */
export function getAvailableStyles(): Array<{ value: PetImageStyle; label: string; description: string }> {
  return [
    {
      value: "pixar",
      label: "Pixar Style",
      description: "3D animated with vibrant colors and expressive features",
    },
    {
      value: "cartoon",
      label: "Cartoon",
      description: "Cute illustration with bold outlines and bright colors",
    },
    {
      value: "realistic",
      label: "Realistic",
      description: "Photorealistic portrait with detailed textures",
    },
    {
      value: "anime",
      label: "Anime",
      description: "Stylized with large expressive eyes",
    },
    {
      value: "watercolor",
      label: "Watercolor",
      description: "Soft artistic painting with gentle colors",
    },
  ];
}
