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
  pixar: "Transform into Pixar 3D animation style while preserving ALL distinctive features, colors, markings, and breed characteristics. Keep the pet instantly recognizable.",
  cartoon: "Create a cartoon illustration preserving ALL distinctive features, exact colors, patterns, and markings. Keep the pet clearly recognizable with bold outlines.",
  realistic: "Create a hyper-realistic portrait maintaining ALL distinctive features, exact colors, patterns, and breed characteristics. Professional photography quality.",
  anime: "Transform into anime art style while preserving ALL distinctive features, exact colors, and markings. Keep the pet recognizable with anime-style rendering.",
  watercolor: "Create a watercolor painting preserving ALL distinctive colors, markings, and features. Keep the pet clearly recognizable with artistic brush strokes.",
};

/**
 * Generate a pet PFP using DALL-E 3 with a blue border matching the Base app color
 */
export async function generatePetPFP(options: GeneratePetPFPOptions): Promise<string> {
  const { petName, species, breed, personality, style, originalImageUrl } = options;

  // Build the prompt emphasizing preservation of pet's appearance
  const styleDescription = stylePrompts[style];
  const breedInfo = breed ? ` ${breed}` : "";
  const personalityInfo = personality ? ` with a ${personality} personality` : "";

  let prompt = `Based on the reference image: ${styleDescription} `;
  prompt += `This is a${breedInfo} ${species}${personalityInfo}. `;
  prompt += `CRITICAL: Maintain the EXACT appearance from the reference image - same colors, same markings, same facial features, same body type. `;
  prompt += `Only change the artistic style, NOT the pet's appearance. `;
  prompt += `Add a prominent blue border (#0052FF) around the portrait. `;
  prompt += `Centered composition, clean background, professional quality.`;

  console.log("[Image Generation] Generating PFP with prompt:", prompt);

  try {
    // Use original image as reference for better feature preservation
    const result = await generateImageCore({
      prompt,
      originalImages: originalImageUrl ? [{ url: originalImageUrl, mimeType: "image/jpeg" }] : undefined,
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
