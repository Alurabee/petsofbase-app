import { generateImage } from './server/_core/imageGeneration';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRANKIE_IMAGE_URL = 'https://files.manuscdn.com/user_upload_by_module/session_file/117699726/fMRyzDcPjwmSwLcz.png';

// EXACT original Manus prompt
const styleDescription = "A Pixar-style 3D animated character portrait. Highly detailed 3D render with smooth, polished surfaces, vibrant saturated colors, large expressive eyes with glossy reflections, soft rounded features, professional Pixar animation studio quality. Warm studio lighting, subtle rim lighting, clean gradient background.";

const prompt = `Transform this pet photo into ${styleDescription} IMPORTANT: Preserve the pet's exact coloring, markings, and distinctive features. Only change the artistic style, not the pet's appearance. A brown dachshund. Centered composition, facing forward, professional quality portrait. Absolutely NO text, NO labels, NO watermarks, NO color codes, NO words anywhere in the image.`;

async function testManusForgeAPI() {
  console.log('🐕 Testing Manus Forge API with Frankie...\n');
  
  try {
    const result = await generateImage({
      prompt,
      originalImages: [{
        url: FRANKIE_IMAGE_URL,
        mimeType: 'image/png'
      }]
    });
    
    if (result.url) {
      console.log(`✅ Generated successfully!`);
      console.log(`URL: ${result.url}`);
      
      // Download and save locally
      const imageResponse = await fetch(result.url);
      const imageBuffer = await imageResponse.arrayBuffer();
      const outputPath = path.join(__dirname, 'frankie-manus-forge.png');
      fs.writeFileSync(outputPath, Buffer.from(imageBuffer));
      console.log(`Saved to: ${outputPath}`);
    }
  } catch (error) {
    console.error(`❌ Failed:`, error);
  }
}

testManusForgeAPI().catch(console.error);
