import { generateImage } from './server/_core/imageGeneration';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRANKIE_IMAGE_URL = 'file://' + path.resolve(__dirname, 'Frankie.png');

// Use EXACT prompt structure from working Manus version
const styleDescription = "Pixar 3D animation style. Keep the same animal, same breed, same coloring, same pose, same facial features. Apply Pixar's signature 3D rendering: smooth polished surfaces, large expressive eyes with glossy reflections, warm studio lighting, subtle rim lighting. Same pet, Pixar style.";

const prompt = `Transform this pet photo into ${styleDescription} IMPORTANT: Preserve the pet's exact coloring, markings, and distinctive features. Only change the artistic style, not the pet's appearance. Centered composition, facing forward, professional quality portrait.`;

async function testFinalPrompt() {
  console.log('🐕 Testing with EXACT working prompt structure...\n');
  console.log('Prompt:', prompt, '\n');
  
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
      const outputPath = path.join(__dirname, 'frankie-final-test.png');
      fs.writeFileSync(outputPath, Buffer.from(imageBuffer));
      
      console.log(`✅ Generated: ${outputPath}`);
    }
  } catch (error) {
    console.error(`❌ Failed:`, error);
  }
}

testFinalPrompt().catch(console.error);
