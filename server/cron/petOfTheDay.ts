/**
 * Pet of the Day Cron Job
 * Runs daily at 12 PM ET (17:00 UTC / 16:00 UTC depending on DST)
 * 
 * Selects a random pet from eligible pets (5+ votes, not featured in past 7 days)
 * and awards the "Pet of the Day" badge
 */

import { selectPetOfTheDay } from '../db';

export async function runPetOfTheDayCron() {
  try {
    console.log('[Cron] Starting Pet of the Day selection...');
    const selectedPet = await selectPetOfTheDay();
    
    if (selectedPet) {
      console.log(`[Cron] Successfully selected Pet of the Day: ${selectedPet.petName} (ID: ${selectedPet.petId})`);
      return {
        success: true,
        petId: selectedPet.petId,
        petName: selectedPet.petName,
        date: selectedPet.date
      };
    } else {
      console.log('[Cron] No eligible pets found for Pet of the Day');
      return {
        success: false,
        reason: 'No eligible pets'
      };
    }
  } catch (error) {
    console.error('[Cron] Pet of the Day selection failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// If running directly (for testing)
if (import.meta.url === `file://${process.argv[1]}`) {
  runPetOfTheDayCron()
    .then(result => {
      console.log('Result:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
