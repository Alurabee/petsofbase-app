import { generatePetPFP, type PetImageStyle } from './server/imageGeneration';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRANKIE_IMAGE_URL = 'https://files.manuscdn.com/user_upload_by_module/session_file/117699726/fMRyzDcPjwmSwLcz.png';

const styles: PetImageStyle[] = ['pixar', 'cartoon', 'realistic', 'anime', 'watercolor'];

async function testAllStyles() {
  console.log('🐕 Testing all 5 styles with Frankie using Manus Forge API...\n');
  
  for (const style of styles) {
    console.log(`\n📸 Generating ${style} style...`);
    
    try {
      const imageUrl = await generatePetPFP({
        petName: 'Frankie',
        species: 'dog',
        breed: 'dachshund',
        style,
        originalImageUrl: FRANKIE_IMAGE_URL
      });
      
      console.log(`✅ ${style}: ${imageUrl}`);
      
      // Download and save locally
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const outputPath = path.join(__dirname, `frankie-final-${style}.png`);
      fs.writeFileSync(outputPath, Buffer.from(imageBuffer));
      console.log(`   Saved to: ${outputPath}`);
      
    } catch (error) {
      console.error(`❌ ${style} failed:`, error);
    }
  }
  
  console.log('\n✨ All styles tested!');
}

testAllStyles().catch(console.error);
