import { generateImage } from './server/_core/imageGeneration';

async function testImageGeneration() {
  console.log('Testing Replicate image generation...');
  
  try {
    const result = await generateImage({
      prompt: 'A cute golden retriever dog in Pixar animation style, colorful, vibrant, professional digital art',
    });
    
    console.log('✅ Image generation successful!');
    console.log('Image URL:', result.url);
    console.log('\nYou can view the generated image at the URL above');
    
  } catch (error) {
    console.error('❌ Image generation failed:', error);
  }
}

testImageGeneration();
