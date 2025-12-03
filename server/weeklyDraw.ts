import { getDb } from "./db";
import { weeklyDraw, petOfTheDay, pets, users } from "../drizzle/schema";
import { desc, eq, and, gte, lte, sql } from "drizzle-orm";

/**
 * Get the Monday of the current week (week starts on Monday)
 */
function getMondayOfWeek(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Get all Pet of the Day entries for the current week
 */
export async function getCurrentWeekEntries() {
  const db = await getDb();
  if (!db) return [];

  const monday = getMondayOfWeek();
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const sundayStr = sunday.toISOString().split('T')[0];

  const entries = await db
    .select({
      id: petOfTheDay.id,
      petId: petOfTheDay.petId,
      date: petOfTheDay.date,
      voteCount: petOfTheDay.voteCount,
      petName: pets.name,
      petImageUrl: pets.pfpImageUrl,
      petSpecies: pets.species,
      petBreed: pets.breed,
    })
    .from(petOfTheDay)
    .leftJoin(pets, eq(petOfTheDay.petId, pets.id))
    .where(and(
      gte(petOfTheDay.date, monday),
      lte(petOfTheDay.date, sundayStr)
    ))
    .orderBy(petOfTheDay.date);

  return entries;
}

/**
 * Conduct weekly draw and select winner
 */
export async function conductWeeklyDraw(): Promise<{
  success: boolean;
  winner?: any;
  message: string;
}> {
  const db = await getDb();
  if (!db) return { success: false, message: "Database unavailable" };

  const monday = getMondayOfWeek();
  
  // Check if draw already conducted for this week
  const existing = await db
    .select()
    .from(weeklyDraw)
    .where(eq(weeklyDraw.weekStartDate, monday))
    .limit(1);

  if (existing.length > 0) {
    return { success: false, message: "Draw already conducted for this week" };
  }

  // Get all entries for the week
  const entries = await getCurrentWeekEntries();
  
  if (entries.length === 0) {
    return { success: false, message: "No entries for this week" };
  }

  // Random selection from entries
  const randomIndex = Math.floor(Math.random() * entries.length);
  const winner = entries[randomIndex];

  // Record the winner
  await db.insert(weeklyDraw).values({
    weekStartDate: monday,
    winningPetId: winner.petId!,
    winningPetOfTheDayId: winner.id,
    prizeAmount: 5, // $5 USDC
    prizeAwarded: 0, // Not yet awarded
  });

  return {
    success: true,
    winner,
    message: `${winner.petName} won the weekly draw!`,
  };
}

/**
 * Get current week's draw status
 */
export async function getCurrentWeekDraw() {
  const db = await getDb();
  if (!db) return null;

  const monday = getMondayOfWeek();
  
  const draw = await db
    .select({
      id: weeklyDraw.id,
      weekStartDate: weeklyDraw.weekStartDate,
      winningPetId: weeklyDraw.winningPetId,
      prizeAmount: weeklyDraw.prizeAmount,
      prizeAwarded: weeklyDraw.prizeAwarded,
      createdAt: weeklyDraw.createdAt,
      petName: pets.name,
      petImageUrl: pets.pfpImageUrl,
      petSpecies: pets.species,
      petBreed: pets.breed,
      ownerName: users.name,
    })
    .from(weeklyDraw)
    .leftJoin(pets, eq(weeklyDraw.winningPetId, pets.id))
    .leftJoin(users, eq(pets.userId, users.id))
    .where(eq(weeklyDraw.weekStartDate, monday))
    .limit(1);

  return draw.length > 0 ? draw[0] : null;
}

/**
 * Get draw history
 */
export async function getDrawHistory(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const history = await db
    .select({
      id: weeklyDraw.id,
      weekStartDate: weeklyDraw.weekStartDate,
      winningPetId: weeklyDraw.winningPetId,
      prizeAmount: weeklyDraw.prizeAmount,
      prizeAwarded: weeklyDraw.prizeAwarded,
      createdAt: weeklyDraw.createdAt,
      petName: pets.name,
      petImageUrl: pets.pfpImageUrl,
      ownerName: users.name,
    })
    .from(weeklyDraw)
    .leftJoin(pets, eq(weeklyDraw.winningPetId, pets.id))
    .leftJoin(users, eq(pets.userId, users.id))
    .orderBy(desc(weeklyDraw.weekStartDate))
    .limit(limit);

  return history;
}

/**
 * Get days until next draw (Monday 12pm ET)
 */
export function getDaysUntilDraw(): number {
  const now = new Date();
  const nextMonday = new Date(getMondayOfWeek());
  nextMonday.setDate(nextMonday.getDate() + 7); // Next Monday
  nextMonday.setHours(12, 0, 0, 0); // 12pm

  const diff = nextMonday.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
