import { generateImage } from './server/_core/imageGeneration';

// Sample pet image URL (golden retriever from your screenshot)
const samplePetImageUrl = "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=1024&h=1024&fit=crop";

const styles = [
  {
    name: "Pixar",
    prompt: "A cute dog in Pixar 3D animation style, vibrant colors, expressive large eyes, smooth 3D rendering, professional character design, warm lighting, adorable personality"
  },
  {
    name: "Cartoon",
    prompt: "A cute dog in cartoon illustration style, bold black outlines, vibrant flat colors, playful expression, simple shapes, fun and energetic, comic book art"
  },
  {
    name: "Realistic",
    prompt: "A cute dog in photorealistic style, detailed fur texture, natural lighting, professional pet photography, sharp focus, high detail, studio quality portrait"
  },
  {
    name: "Anime",
    prompt: "A cute dog in anime art style, large expressive eyes, soft shading, pastel colors, kawaii aesthetic, manga-inspired, adorable and stylized"
  },
  {
    name: "Watercolor",
    prompt: "A cute dog in watercolor painting style, soft brush strokes, gentle colors, artistic and dreamy, flowing paint texture, delicate and elegant"
  }
];

async function testAllStyles() {
  console.log('🎨 Testing FLUX 1.1 Pro with all 5 art styles...\n');
  console.log('Using sample pet image:', samplePetImageUrl);
  console.log('---\n');

  for (const style of styles) {
    console.log(`\n🖼️  Generating ${style.name} style...`);
    console.log(`Prompt: ${style.prompt.substring(0, 80)}...`);
    
    try {
      const startTime = Date.now();
      
      const result = await generateImage({
        prompt: style.prompt,
        originalImages: [{
          url: samplePetImageUrl,
          mimeType: "image/jpeg"
        }]
      });
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      
      console.log(`✅ ${style.name} generated in ${duration}s`);
      console.log(`📸 Image URL: ${result.url}`);
      console.log('---');
      
    } catch (error) {
      console.error(`❌ ${style.name} failed:`, error);
      console.log('---');
    }
  }

  console.log('\n✨ All styles tested! Check the URLs above to view the generated images.');
}

testAllStyles();
