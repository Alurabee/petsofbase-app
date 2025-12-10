/**
 * Badge System - Auto-award badges based on user actions
 */

import { getDb } from "./db";
import { badges, userBadges, pets, votes } from "../drizzle/schema";
import { eq, and, isNull, sql } from "drizzle-orm";

// Badge IDs (from seeded data)
export const BADGE_IDS = {
  FIRST_STEPS: 1,
  POPULAR_PET: 2,
  COMMUNITY_FAVORITE: 3,
  VIRAL_STAR: 4,
  LEGEND: 5,
  HALL_OF_FAMER: 6,
  STYLE_EXPLORER: 7,
  PERFECTIONIST: 8,
  ACTIVE_VOTER: 9,
  COLLECTOR: 10,
  LEADERBOARD_ROYALTY: 11,
  PET_OF_THE_DAY: 12,
  RISING_STAR: 13,
  OG_MEMBER: 14,
};

/**
 * Award a badge to a user/pet if they don't already have it
 */
export async function awardBadge(
  userId: number,
  badgeId: number,
  petId?: number | null
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Check if badge already awarded
    const existing = await db
      .select()
      .from(userBadges)
      .where(
        and(
          eq(userBadges.userId, userId),
          eq(userBadges.badgeId, badgeId),
          petId ? eq(userBadges.petId, petId) : isNull(userBadges.petId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return false; // Already has badge
    }

    // Award badge
    await db.insert(userBadges).values({
      userId,
      badgeId,
      petId: petId || null,
    });

    console.log(`🏅 Badge ${badgeId} awarded to user ${userId} (pet: ${petId || "none"})`);
    return true;
  } catch (error) {
    console.error("Error awarding badge:", error);
    return false;
  }
}

/**
 * Check and award milestone badges based on vote count
 */
export async function checkVoteMilestoneBadges(petId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const pet = await db.select().from(pets).where(eq(pets.id, petId)).limit(1);
  if (pet.length === 0) return;

  const voteCount = pet[0].voteCount;
  const userId = pet[0].userId;

  // Check all vote milestones
  const milestones = [
    { votes: 5, badgeId: BADGE_IDS.POPULAR_PET },
    { votes: 10, badgeId: BADGE_IDS.COMMUNITY_FAVORITE },
    { votes: 25, badgeId: BADGE_IDS.VIRAL_STAR },
    { votes: 50, badgeId: BADGE_IDS.LEGEND },
    { votes: 100, badgeId: BADGE_IDS.HALL_OF_FAMER },
  ];

  for (const milestone of milestones) {
    if (voteCount >= milestone.votes) {
      await awardBadge(userId, milestone.badgeId, petId);
    }
  }
}

/**
 * Check and award achievement badges based on user actions
 */
export async function checkAchievementBadges(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Check votes cast (Active Voter - 10+ votes)
  const votesCast = await db
    .select({ count: sql<number>`count(*)` })
    .from(votes)
    .where(eq(votes.userId, userId));

  if (votesCast[0]?.count >= 10) {
    await awardBadge(userId, BADGE_IDS.ACTIVE_VOTER);
  }

  // Check generations (Style Explorer - 3+ generations)
  const userPets = await db
    .select()
    .from(pets)
    .where(eq(pets.userId, userId));

  const totalGenerations = userPets.reduce((sum, pet) => sum + (pet.generationCount || 0), 0);

  if (totalGenerations >= 3) {
    await awardBadge(userId, BADGE_IDS.STYLE_EXPLORER);
  }

  if (totalGenerations >= 5) {
    await awardBadge(userId, BADGE_IDS.PERFECTIONIST);
  }

  // Check NFTs minted (Collector - 3+ mints)
  const mintedNFTs = userPets.filter(pet => pet.nftTokenId !== null);

  if (mintedNFTs.length >= 3) {
    await awardBadge(userId, BADGE_IDS.COLLECTOR);
  }
}

/**
 * Award "First Steps" badge when user uploads their first pet
 */
export async function awardFirstStepsBadge(userId: number, petId: number): Promise<void> {
  await awardBadge(userId, BADGE_IDS.FIRST_STEPS, petId);
}

/**
 * Award "Pet of the Day" badge
 */
export async function awardPetOfTheDayBadge(userId: number, petId: number): Promise<void> {
  await awardBadge(userId, BADGE_IDS.PET_OF_THE_DAY, petId);
}

/**
 * Award "Rising Star" badge
 */
export async function awardRisingStarBadge(userId: number, petId: number): Promise<void> {
  await awardBadge(userId, BADGE_IDS.RISING_STAR, petId);
}

/**
 * Award "Leaderboard Royalty" badge (top 3)
 */
export async function awardLeaderboardBadge(userId: number, petId: number): Promise<void> {
  await awardBadge(userId, BADGE_IDS.LEADERBOARD_ROYALTY, petId);
}

/**
 * Award "OG Member" badge to first 100 users
 */
export async function checkOGMemberBadge(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Check if user ID is <= 100
  if (userId <= 100) {
    await awardBadge(userId, BADGE_IDS.OG_MEMBER);
  }
}

/**
 * Get all badges earned by a user
 */
export async function getUserBadges(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      badgeId: userBadges.badgeId,
      petId: userBadges.petId,
      earnedAt: userBadges.earnedAt,
      name: badges.name,
      icon: badges.icon,
      description: badges.description,
      tier: badges.tier,
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, userId))
    .orderBy(userBadges.earnedAt);

  return result;
}

/**
 * Get badges for a specific pet
 */
export async function getPetBadges(petId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      badgeId: userBadges.badgeId,
      earnedAt: userBadges.earnedAt,
      name: badges.name,
      icon: badges.icon,
      description: badges.description,
      tier: badges.tier,
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.petId, petId))
    .orderBy(userBadges.earnedAt);

  return result;
}
