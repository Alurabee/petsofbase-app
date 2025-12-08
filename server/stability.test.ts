import { describe, it, expect } from 'vitest';
import { generateImage } from './_core/imageGeneration';

describe('Stability AI Integration', () => {
  it('should validate API key with simple generation', async () => {
    const result = await generateImage({
      prompt: 'A simple red circle',
    });

    expect(result.url).toBeDefined();
    expect(result.url).toMatch(/^data:image/);
    
    console.log('✅ Stability AI API key is valid!');
    console.log('Generated image (base64):', result.url?.substring(0, 100) + '...');
  }, 60000); // 60 second timeout for API call
});
