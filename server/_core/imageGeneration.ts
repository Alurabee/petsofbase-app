import Replicate from 'replicate';
import { ENV } from './env';

const replicate = ENV.replicateApiToken
  ? new Replicate({ auth: ENV.replicateApiToken })
  : null;

export type GenerateImageOptions = {
  prompt: string;
  originalImages?: Array<{
    url?: string;
    b64Json?: string;
    mimeType?: string;
  }>;
};

export type GenerateImageResponse = {
  url?: string;
};

export async function generateImage(
  options: GenerateImageOptions
): Promise<GenerateImageResponse> {
  if (!replicate) {
    throw new Error("Replicate API token not configured. Set REPLICATE_API_TOKEN environment variable.");
  }

  try {
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: options.prompt,
          num_outputs: 1,
        },
      }
    ) as string[];

    if (!output || output.length === 0) {
      throw new Error("No image generated");
    }

    return { url: output[0] };
  } catch (error: any) {
    console.error('[ImageGeneration] Error:', error);
    throw new Error(`Image generation failed: ${error.message}`);
  }
}
