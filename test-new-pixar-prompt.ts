import { generateImage } from './server/_core/imageGeneration';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRANKIE_IMAGE_URL = 'https://files.manuscdn.com/user_upload_by_module/session_file/117699726/fMRyzDcPjwmSwLcz.png';

// New Pixar prompt with identity preservation
const prompt = `Transform the uploaded pet photo into a Pixar-style 3D character portrait.
Preserve the pet's identity: same silhouette, face shape, fur pattern, markings, and expression so it is recognisable.
Big expressive glossy eyes, soft rounded features, smooth polished surfaces, warm cinematic lighting, subtle rim lighting,
centered head-and-shoulders square profile picture composition, clean Base-blue gradient background, studio rendering quality, highly detailed, uplifting look, premium NFT avatar style.
This is a pet transformation task, not a redesign. Preserve the true proportions, silhouette, fur pattern, ear shape, colors, and expression — stylise only in rendering and background.`;

const negativePrompt = `mutated, distorted, creepy, horror, off-center head, wrong species, wrong colors, messy fur, extra limbs, text, watermark, blurred background clutter`;

async function testNewPixarPrompt() {
  console.log('🐕 Testing NEW Pixar prompt with Replicate SDXL...\n');
  
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
      const outputPath = path.join(__dirname, 'frankie-new-pixar.png');
      fs.writeFileSync(outputPath, Buffer.from(imageBuffer));
      
      console.log(`✅ Generated: ${outputPath}`);
      console.log(`URL: ${result.url}`);
    }
  } catch (error) {
    console.error(`❌ Failed:`, error);
  }
}

testNewPixarPrompt().catch(console.error);
