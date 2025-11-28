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
  pixar: "A Pixar-style 3D animated character portrait. Highly detailed 3D render with smooth, polished surfaces, vibrant saturated colors, large expressive eyes with glossy reflections, soft rounded features, professional Pixar animation studio quality. Warm studio lighting, subtle rim lighting, clean gradient background.",
  cartoon: "A vibrant cartoon illustration with bold black outlines, flat bright colors, exaggerated cute features, large friendly eyes, simplified shapes, playful expression. Comic book style with clean lines and solid color fills. Colorful gradient background.",
  realistic: "A hyper-realistic professional portrait photograph. Ultra-detailed fur/feather texture, natural lighting, shallow depth of field, professional studio photography, crisp focus, rich colors, photographic quality. Clean neutral background.",
  anime: "An anime-style character portrait with large sparkling eyes, detailed shading with cel-shading technique, vibrant colors, glossy highlights, manga-inspired art style. Smooth anime rendering with dramatic lighting. Soft gradient background.",
  watercolor: "A beautiful watercolor painting with soft flowing colors, visible brush strokes, artistic paper texture, gentle color blending, traditional watercolor technique, delicate and elegant. Subtle watercolor background wash.",
};

/**
 * Generate a pet PFP using DALL-E 3 with a blue border matching the Base app color
 */
export async function generatePetPFP(options: GeneratePetPFPOptions): Promise<string> {
  const { petName, species, breed, personality, style, originalImageUrl } = options;

  // Build a detailed description from the pet's attributes
  const breedInfo = breed ? ` ${breed}` : "";
  const personalityInfo = personality ? ` with a ${personality} expression` : "";
  
  // Create a detailed subject description
  const subjectDescription = `A${breedInfo} ${species}${personalityInfo}.`;
  
  // Get the style-specific rendering instructions
  const styleDescription = stylePrompts[style];
  
  // Build the complete prompt
  let prompt = `${subjectDescription} ${styleDescription} `;
  prompt += `The portrait must have a prominent blue border frame (#0052FF, Base blue color) around the entire image. `;
  prompt += `Centered composition, facing forward, professional quality, suitable for a profile picture.`;
  
  console.log("[Image Generation] Pet description:", subjectDescription);
  console.log("[Image Generation] Style:", style);

  console.log("[Image Generation] Generating PFP with prompt:", prompt);

  try {
    // Generate a new image from scratch (not editing) for stronger artistic transformation
    // The original image URL is not used to avoid subtle edits - we want full artistic rendering
    const result = await generateImageCore({
      prompt,
      // Do NOT use originalImages - we want pure generation, not editing
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
