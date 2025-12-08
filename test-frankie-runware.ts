import { generateImage } from './server/_core/imageGeneration';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRANKIE_IMAGE_URL = 'file://' + path.resolve(__dirname, 'Frankie.png');

const styles = {
  pixar: "A Pixar-style 3D animated character portrait. Highly detailed 3D render with smooth, polished surfaces, vibrant saturated colors, large expressive eyes with glossy reflections, soft rounded features, professional Pixar animation studio quality. Warm studio lighting, subtle rim lighting, clean gradient background. Keep the original face, colour, expression, pose preserved.",
  
  cartoon: "A vibrant cartoon illustration with bold black outlines, flat bright colors, exaggerated cute features, large friendly eyes, simplified shapes, playful expression. Comic book style with clean lines and solid color fills. Colorful gradient background. Keep the original face, colour, expression, pose preserved.",
  
  realistic: "A hyper-realistic professional portrait photograph. Ultra-detailed fur/feather texture, natural lighting, shallow depth of field, professional studio photography, crisp focus, rich colors, photographic quality. Clean neutral background. Keep the original face, colour, expression, pose preserved.",
  
  anime: "An anime-style character portrait with large sparkling eyes, detailed shading with cel-shading technique, vibrant colors, glossy highlights, manga-inspired art style. Smooth anime rendering with dramatic lighting. Soft gradient background. Keep the original face, colour, expression, pose preserved.",
  
  watercolor: "A beautiful watercolor painting with soft flowing colors, visible brush strokes, artistic paper texture, gentle color blending, traditional watercolor technique, delicate and elegant. Subtle watercolor background wash. Keep the original face, colour, expression, pose preserved."
};

async function testAllStyles() {
  console.log('🐕 Testing Runware image generation with Frankie...\n');
  
  for (const [styleName, prompt] of Object.entries(styles)) {
    console.log(`Generating ${styleName} style...`);
    
    try {
      const result = await generateImage({
        prompt,
        originalImages: [{
          url: FRANKIE_IMAGE_URL,
          mimeType: 'image/png'
        }]
      });
      
      if (result.url) {
        // Download and save the image
        const imageResponse = await fetch(result.url);
        const imageBuffer = await imageResponse.arrayBuffer();
        const outputPath = path.join(__dirname, `frankie-runware-${styleName}.png`);
        fs.writeFileSync(outputPath, Buffer.from(imageBuffer));
        
        console.log(`✅ ${styleName}: ${outputPath}`);
      }
    } catch (error) {
      console.error(`❌ ${styleName} failed:`, error);
    }
  }
  
  console.log('\n🎉 All styles generated!');
}

testAllStyles().catch(console.error);
