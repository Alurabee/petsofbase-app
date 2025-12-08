import { generateImage } from './server/_core/imageGeneration';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRANKIE_IMAGE_URL = 'https://files.manuscdn.com/user_upload_by_module/session_file/117699726/fMRyzDcPjwmSwLcz.png';

// EXACT original Manus prompt structure
const styleDescription = "A Pixar-style 3D animated character portrait. Highly detailed 3D render with smooth, polished surfaces, vibrant saturated colors, large expressive eyes with glossy reflections, soft rounded features, professional Pixar animation studio quality. Warm studio lighting, subtle rim lighting, clean gradient background.";

const prompt = `Transform this pet photo into ${styleDescription} IMPORTANT: Preserve the pet's exact coloring, markings, and distinctive features. Only change the artistic style, not the pet's appearance. A brown dachshund. Centered composition, facing forward, professional quality portrait. Absolutely NO text, NO labels, NO watermarks, NO color codes, NO words anywhere in the image.`;

async function testOriginalManusPrompt() {
  console.log('🐕 Testing EXACT original Manus prompt...\n');
  
  try {
    const result = await generateImage({
      prompt,
      originalImages: [{
        url: FRANKIE_IMAGE_URL,
        mimeType: 'image/png'
      }]
    });
    
    if (result.url) {
      const imageResponse = await fetch(result.url);
      const imageBuffer = await imageResponse.arrayBuffer();
      const outputPath = path.join(__dirname, 'frankie-original-manus-prompt.png');
      fs.writeFileSync(outputPath, Buffer.from(imageBuffer));
      
      console.log(`✅ Generated: ${outputPath}`);
    }
  } catch (error) {
    console.error(`❌ Failed:`, error);
  }
}

testOriginalManusPrompt().catch(console.error);
