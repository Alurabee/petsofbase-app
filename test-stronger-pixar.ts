import { generateImage } from './server/_core/imageGeneration';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRANKIE_IMAGE_URL = 'https://files.manuscdn.com/user_upload_by_module/session_file/117699726/fMRyzDcPjwmSwLcz.png';

// Shorter, more focused Pixar prompt
const prompt = `Pixar 3D animated dog character. Large expressive cartoon eyes, exaggerated cute features, vibrant colors, smooth polished 3D render, warm studio lighting, professional Pixar animation quality. Keep the same brown dachshund breed, same pose.`;

const negativePrompt = `realistic, photographic, horror, mutated, wrong species, text, watermark`;

async function testStrongerPixar() {
  console.log('🐕 Testing STRONGER Pixar stylization...\n');
  
  try {
    const result = await generateImage({
      prompt,
      negativePrompt,
      originalImages: [{
        url: FRANKIE_IMAGE_URL,
        mimeType: 'image/png'
      }]
    });
    
    if (result.url) {
      const imageResponse = await fetch(result.url);
      const imageBuffer = await imageResponse.arrayBuffer();
      const outputPath = path.join(__dirname, 'frankie-stronger-pixar.png');
      fs.writeFileSync(outputPath, Buffer.from(imageBuffer));
      
      console.log(`✅ Generated: ${outputPath}`);
    }
  } catch (error) {
    console.error(`❌ Failed:`, error);
  }
}

testStrongerPixar().catch(console.error);
