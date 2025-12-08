import { generateImage } from './server/_core/imageGeneration';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRANKIE_IMAGE_URL = 'file://' + path.resolve(__dirname, 'Frankie.png');

// DOG-FOCUSED prompts that emphasize transformation, not creation
const styles = {
  pixar: "Transform this dog into Pixar 3D animation style. Keep the same brown dachshund, same pose, same facial features. Apply Pixar's signature 3D rendering: smooth polished surfaces, large expressive eyes with glossy reflections, warm studio lighting. Same dog, Pixar style.",
  
  cartoon: "Transform this dog into vibrant cartoon illustration style. Keep the same brown dachshund, same pose, same facial features. Apply bold black outlines, flat bright colors, simplified shapes. Same dog, cartoon style.",
  
  anime: "Transform this dog into anime art style. Keep the same brown dachshund, same pose, same facial features. Apply anime rendering: large sparkling eyes, cel-shading, vibrant colors, glossy highlights. Same dog, anime style.",
  
  watercolor: "Transform this dog into watercolor painting style. Keep the same brown dachshund, same pose, same facial features. Apply watercolor technique: soft flowing colors, visible brush strokes, gentle blending. Same dog, watercolor style."
};

async function testFixedPrompts() {
  console.log('🐕 Testing Runware with DOG-FOCUSED prompts...\n');
  
  // Test just Pixar first to save credits
  const styleName = 'pixar';
  const prompt = styles.pixar;
  
  console.log(`Testing ${styleName} with prompt:`);
  console.log(`"${prompt}"\n`);
  
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
      const outputPath = path.join(__dirname, `frankie-fixed-${styleName}.png`);
      fs.writeFileSync(outputPath, Buffer.from(imageBuffer));
      
      console.log(`✅ Generated: ${outputPath}`);
    }
  } catch (error) {
    console.error(`❌ Failed:`, error);
  }
}

testFixedPrompts().catch(console.error);
