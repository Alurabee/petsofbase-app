/**
 * Cron Scheduler
 * Manages all scheduled jobs for the application
 */

import cron from 'node-cron';
import { runPetOfTheDayCron } from '../cron/petOfTheDay';

export function initializeCronJobs() {
  console.log('[Cron] Initializing scheduled jobs...');

  // Pet of the Day - Daily at 12 PM ET
  // ET is UTC-5 (standard) or UTC-4 (daylight saving)
  // 12 PM ET = 5 PM UTC (standard) or 4 PM UTC (daylight)
  // Using 5 PM UTC (17:00) for consistency
  const petOfTheDaySchedule = '0 17 * * *'; // Every day at 5 PM UTC (12 PM ET standard time)
  
  cron.schedule(petOfTheDaySchedule, async () => {
    console.log('[Cron] Running Pet of the Day selection...');
    try {
      const result = await runPetOfTheDayCron();
      if (result.success) {
        console.log(`[Cron] Pet of the Day selected: ${result.petName} (ID: ${result.petId})`);
      } else {
        console.log(`[Cron] Pet of the Day selection skipped: ${result.reason || result.error}`);
      }
    } catch (error) {
      console.error('[Cron] Pet of the Day cron failed:', error);
    }
  });

  console.log(`[Cron] Pet of the Day scheduled: ${petOfTheDaySchedule} (12 PM ET / 5 PM UTC)`);
  console.log('[Cron] All scheduled jobs initialized successfully');
}
