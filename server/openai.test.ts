import { describe, it, expect } from 'vitest';
import { generateImage } from './_core/imageGeneration';

describe('OpenAI DALL-E 3 Integration', () => {
  it('should generate image with valid API key', async () => {
    const result = await generateImage({
      prompt: 'A simple red circle on white background',
    });

    expect(result.url).toBeDefined();
    expect(result.url).toMatch(/^https?:\/\//);
    
    console.log('✅ DALL-E 3 API key is valid!');
    console.log('Generated image URL:', result.url);
  }, 60000); // 60 second timeout for API call
});
