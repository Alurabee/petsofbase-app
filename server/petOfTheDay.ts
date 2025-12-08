import { getDb } from "./db";
import { petOfTheDay, petOfTheDayVotes, pets } from "../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";

/**
 * Get today's date in YYYY-MM-DD format (ET timezone)
 */
function getTodayET(): string {
  const now = new Date();
  // Convert to ET (UTC-5 or UTC-4 depending on DST)
  const etDate = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  return etDate.toISOString().split('T')[0];
}

/**
 * Select a random pet to be Pet of the Day
 * Prioritizes pets that haven't been featured recently
 */
export async function selectPetOfTheDay(): Promise<number> {
  // HYBRID MODEL: Get pets with 5+ votes, PFPs, and not featured in last 7 days
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const recentlyFeatured = await db
    .select({ petId: petOfTheDay.petId })
    .from(petOfTheDay)
    .where(sql`DATE(${petOfTheDay.createdAt}) > DATE_SUB(NOW(), INTERVAL 7 DAY)`);

  const recentlyFeaturedIds = recentlyFeatured.map((r: any) => r.petId);

  // Get eligible pets (have PFP, 5+ votes, not recently featured)
  const eligiblePets = await db
    .select({ id: pets.id, voteCount: pets.voteCount })
    .from(pets)
    .where(
      and(
        sql`${pets.pfpImageUrl} IS NOT NULL`,
        sql`${pets.voteCount} >= 5`, // MINIMUM 5 VOTES REQUIRED
        recentlyFeaturedIds.length > 0 
          ? sql`${pets.id} NOT IN (${sql.join(recentlyFeaturedIds.map((id: number) => sql`${id}`), sql`, `)})`
          : sql`1=1`
      )
    );

  if (eligiblePets.length === 0) {
    // Fallback: select any pet with a PFP (no vote requirement)
    const anyPets = await db
      .select({ id: pets.id })
      .from(pets)
      .where(
        and(
          sql`${pets.pfpImageUrl} IS NOT NULL`,
          recentlyFeaturedIds.length > 0 
            ? sql`${pets.id} NOT IN (${sql.join(recentlyFeaturedIds.map((id: number) => sql`${id}`), sql`, `)})`
            : sql`1=1`
        )
      );
    
    if (anyPets.length === 0) {
      throw new Error("No pets with PFPs available for Pet of the Day");
    }
    
    const randomIndex = Math.floor(Math.random() * anyPets.length);
    return anyPets[randomIndex].id;
  }

  // Random selection from pets with 5+ votes
  const randomIndex = Math.floor(Math.random() * eligiblePets.length);
  return eligiblePets[randomIndex].id;
}

/**
 * Create today's Pet of the Day entry
 * Should be called once per day at 12pm ET
 */
export async function createTodaysPetOfTheDay(): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const today = getTodayET();

  // Check if today's pet already exists
  const existing = await db
    .select()
    .from(petOfTheDay)
    .where(eq(petOfTheDay.date, today))
    .limit(1);

  if (existing.length > 0) {
    console.log(`Pet of the Day already exists for ${today}`);
    return;
  }

  // Select a pet
  const selectedPetId = await selectPetOfTheDay();

  // Create the entry
  await db.insert(petOfTheDay).values({
    petId: selectedPetId,
    date: today,
    voteCount: 0,
    prizeAwarded: 0,
  });

  console.log(`Created Pet of the Day for ${today}: Pet #${selectedPetId}`);
}

/**
 * Get today's Pet of the Day with pet details
 */
export async function getTodaysPetOfTheDay() {
  const db = await getDb();
  if (!db) return null;
  
  const today = getTodayET();

  const result = await db
    .select({
      id: petOfTheDay.id,
      petId: petOfTheDay.petId,
      date: petOfTheDay.date,
      voteCount: petOfTheDay.voteCount,
      prizeAwarded: petOfTheDay.prizeAwarded,
      petName: pets.name,
      petImageUrl: pets.pfpImageUrl,
      petSpecies: pets.species,
      petBreed: pets.breed,
    })
    .from(petOfTheDay)
    .innerJoin(pets, eq(petOfTheDay.petId, pets.id))
    .where(eq(petOfTheDay.date, today))
    .limit(1);

  return result[0] || null;
}

/**
 * Vote for today's Pet of the Day
 */
export async function voteForPetOfTheDay(userId: number): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) return { success: false, message: "Database not available" };
  
  const todaysPet = await getTodaysPetOfTheDay();

  if (!todaysPet) {
    return { success: false, message: "No Pet of the Day available" };
  }

  // Check if user already voted today
  const existingVote = await db
    .select()
    .from(petOfTheDayVotes)
    .where(
      and(
        eq(petOfTheDayVotes.userId, userId),
        eq(petOfTheDayVotes.petOfTheDayId, todaysPet.id)
      )
    )
    .limit(1);

  if (existingVote.length > 0) {
    return { success: false, message: "You've already voted today!" };
  }

  // Add vote
  await db.insert(petOfTheDayVotes).values({
    userId,
    petOfTheDayId: todaysPet.id,
  });

  // Increment vote count
  await db
    .update(petOfTheDay)
    .set({ voteCount: sql`${petOfTheDay.voteCount} + 1` })
    .where(eq(petOfTheDay.id, todaysPet.id));

  return { success: true, message: "Vote recorded!" };
}

/**
 * Check if user has voted today
 */
export async function hasUserVotedToday(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const todaysPet = await getTodaysPetOfTheDay();
  if (!todaysPet) return false;

  const vote = await db
    .select()
    .from(petOfTheDayVotes)
    .where(
      and(
        eq(petOfTheDayVotes.userId, userId),
        eq(petOfTheDayVotes.petOfTheDayId, todaysPet.id)
      )
    )
    .limit(1);

  return vote.length > 0;
}

/**
 * Get Pet of the Day history (last 7 days)
 */
export async function getPetOfTheDayHistory(limit: number = 7) {
  const db = await getDb();
  if (!db) return [];
  
  const history = await db
    .select({
      id: petOfTheDay.id,
      petId: petOfTheDay.petId,
      date: petOfTheDay.date,
      voteCount: petOfTheDay.voteCount,
      prizeAwarded: petOfTheDay.prizeAwarded,
      petName: pets.name,
      petImageUrl: pets.pfpImageUrl,
      petSpecies: pets.species,
    })
    .from(petOfTheDay)
    .innerJoin(pets, eq(petOfTheDay.petId, pets.id))
    .orderBy(desc(petOfTheDay.date))
    .limit(limit);

  return history;
}
