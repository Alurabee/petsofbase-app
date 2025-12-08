import { generateImageWithFal } from "./_core/falImageGeneration";

export type PetImageStyle = "pixar" | "cartoon" | "realistic" | "anime" | "watercolor";

interface GeneratePetPFPOptions {
  petName: string;
  species: string;
  breed?: string;
  personality?: string;
  style: PetImageStyle;
  originalImageUrl: string;
}

const IDENTITY_ANCHOR = "This is a pet transformation task, not a redesign. Preserve the true proportions, silhouette, fur pattern, ear shape, colors, and expression — stylize only in rendering and background.";

const stylePrompts: Record<PetImageStyle, string> = {
  pixar: `Transform this pet into a Pixar-style 3D animated portrait. ${IDENTITY_ANCHOR}
Keep it clearly the same pet: same species, same face shape, same markings and fur colors, same general expression.
Centered head-and-shoulders, square avatar framing.
Big expressive eyes, soft rounded features, smooth polished surfaces, warm cinematic lighting, subtle rim light.
Clean gradient background in soft blue tones.
Do NOT turn the animal into a human or humanoid character.`,

  cartoon: `Transform this pet into a vibrant cartoon illustration. ${IDENTITY_ANCHOR}
Keep it clearly the same pet: same species, same face shape, same markings and fur colors.
Centered head-and-shoulders, square avatar.
Bold black outlines, flat bright colors, exaggerated cute features, large friendly eyes, simplified shapes, playful expression.
Comic book style with clean lines and solid color fills.
Colorful gradient background.
Do NOT turn the animal into a human or humanoid character.`,

  realistic: `Transform this pet into a hyper-realistic professional portrait. ${IDENTITY_ANCHOR}
Keep it clearly the same pet: same species, same face shape, same markings and fur colors.
Centered head-and-shoulders, square avatar.
Ultra-detailed fur/feather texture, natural lighting, shallow depth of field, professional studio photography, crisp focus, rich colors.
Clean neutral background.
Do NOT turn the animal into a human or humanoid character.`,

  anime: `Transform this pet into a clean anime-style portrait. ${IDENTITY_ANCHOR}
Keep it clearly the same pet: same species, same face shape, same markings and fur colors.
Centered head-and-shoulders, square avatar.
Bright anime eyes, smooth cel-shading, pastel tones, glossy highlights, manga-inspired art style.
Soft gradient background in light blue tones.
Do NOT turn the animal into a human or humanoid character.`,

  watercolor: `Transform this pet into a beautiful watercolor painting. ${IDENTITY_ANCHOR}
Keep it clearly the same pet: same species, same face shape, same markings and fur colors.
Centered head-and-shoulders, square avatar.
Soft flowing colors, visible brush strokes, artistic paper texture, gentle color blending, traditional watercolor technique, delicate and elegant.
Subtle watercolor background wash in soft pastel tones.
Do NOT turn the animal into a human or humanoid character.`,
};

/**
 * Generate a pet PFP using fal.ai Gemini 2.5 Flash Image (Nano Banana)
 */
export async function generatePetPFP(options: GeneratePetPFPOptions): Promise<string> {
  const { petName, species, breed, style, originalImageUrl } = options;

  // Build a detailed description from the pet's attributes
  const breedInfo = breed ? ` ${breed}` : "";
  
  // Get the style-specific rendering instructions
  const prompt = stylePrompts[style];
  
  console.log("[Image Generation] Pet:", petName, `(${breedInfo} ${species})`);
  console.log("[Image Generation] Style:", style);
  console.log("[Image Generation] Generating PFP with fal.ai Nano Banana...");

  try {
    // Generate image using fal.ai Gemini 2.5 Flash Image
    const result = await generateImageWithFal({
      prompt,
      imageUrl: originalImageUrl,
      aspectRatio: "1:1",
      outputFormat: "png",
    });

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
