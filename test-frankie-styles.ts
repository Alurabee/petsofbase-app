import { generateImage } from './server/_core/imageGeneration';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Frankie's photo
const frankieImagePath = path.join(__dirname, 'test-frankie.png');

const styles = [
  {
    name: "Pixar",
    prompt: "A cute brown dachshund dog in Pixar-style 3D animated character portrait. Highly detailed 3D render with smooth, polished surfaces, vibrant saturated colors, large expressive eyes with glossy reflections, soft rounded features, professional Pixar animation studio quality. Warm studio lighting, subtle rim lighting, clean gradient background. Preserve the dog's brown color, long floppy ears, and soulful expression."
  },
  {
    name: "Cartoon",
    prompt: "A cute brown dachshund dog in vibrant cartoon illustration with bold black outlines, flat bright colors, exaggerated cute features, large friendly eyes, simplified shapes, playful expression. Comic book style with clean lines and solid color fills. Colorful gradient background. Preserve the dog's brown color and long floppy ears."
  },
  {
    name: "Realistic",
    prompt: "A cute brown dachshund dog in hyper-realistic professional portrait photograph. Ultra-detailed fur texture, natural lighting, shallow depth of field, professional studio photography, crisp focus, rich colors, photographic quality. Clean neutral background. Preserve the dog's exact brown coloring and features."
  },
  {
    name: "Anime",
    prompt: "A cute brown dachshund dog in anime-style character portrait with large sparkling eyes, detailed shading with cel-shading technique, vibrant colors, glossy highlights, manga-inspired art style. Smooth anime rendering with dramatic lighting. Soft gradient background. Preserve the dog's brown color and long ears."
  },
  {
    name: "Watercolor",
    prompt: "A cute brown dachshund dog in beautiful watercolor painting with soft flowing colors, visible brush strokes, artistic paper texture, gentle color blending, traditional watercolor technique, delicate and elegant. Subtle watercolor background wash. Preserve the dog's brown coloring and gentle expression."
  }
];

async function testFrankieStyles() {
  console.log('🐕 Testing Stability AI with Frankie in all 5 art styles...\n');
  console.log('Using Frankie\'s photo:', frankieImagePath);
  console.log('---\n');

  const results: Array<{style: string, success: boolean, path?: string, error?: string}> = [];

  for (const style of styles) {
    console.log(`\n🎨 Generating ${style.name} style...`);
    
    try {
      const startTime = Date.now();
      
      // Read image file and convert to data URL
      const imageBuffer = fs.readFileSync(frankieImagePath);
      const base64 = imageBuffer.toString('base64');
      const dataUrl = `data:image/png;base64,${base64}`;
      
      const result = await generateImage({
        prompt: style.prompt,
        originalImages: [{
          url: dataUrl,
          mimeType: "image/png"
        }]
      });
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      
      // Save the result
      if (result.url) {
        const outputPath = path.join(__dirname, `frankie-${style.name.toLowerCase()}.png`);
        
        // Extract base64 data and save
        const base64Data = result.url.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync(outputPath, Buffer.from(base64Data, 'base64'));
        
        console.log(`✅ ${style.name} generated in ${duration}s`);
        console.log(`💾 Saved to: ${outputPath}`);
        
        results.push({style: style.name, success: true, path: outputPath});
      }
      
      console.log('---');
      
    } catch (error) {
      console.error(`❌ ${style.name} failed:`, error);
      results.push({style: style.name, success: false, error: String(error)});
      console.log('---');
    }
  }

  console.log('\n📊 SUMMARY:');
  console.log('='.repeat(50));
  results.forEach(r => {
    if (r.success) {
      console.log(`✅ ${r.style}: ${r.path}`);
    } else {
      console.log(`❌ ${r.style}: ${r.error}`);
    }
  });
  console.log('='.repeat(50));
  console.log('\n✨ All styles tested! Check the generated images in the project directory.');
}

testFrankieStyles();
