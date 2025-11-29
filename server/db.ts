import { eq, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, pets, votes, InsertPet, InsertVote, pfpVersions, InsertPfpVersion, referrals, InsertReferral, userReferralStats, InsertUserReferralStats } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Pet Functions ============

export async function createPet(pet: InsertPet) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(pets).values(pet);
  return result;
}

export async function getPetById(petId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(pets).where(eq(pets.id, petId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPetsByUserId(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select().from(pets).where(eq(pets.userId, userId)).orderBy(desc(pets.createdAt));
}

export async function getAllPets(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select().from(pets).orderBy(desc(pets.createdAt)).limit(limit).offset(offset);
}

export async function getLeaderboard(limit = 20) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select().from(pets).orderBy(desc(pets.voteCount), desc(pets.createdAt)).limit(limit);
}

export async function updatePet(petId: number, updates: Partial<InsertPet>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(pets).set(updates).where(eq(pets.id, petId));
}

// ============ Vote Functions ============

export async function createVote(vote: InsertVote) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Insert vote
    await db.insert(votes).values(vote);
    
    // Increment vote count on pet
    await db.update(pets)
      .set({ voteCount: sql`${pets.voteCount} + 1` })
      .where(eq(pets.id, vote.petId));
    
    return true;
  } catch (error) {
    // Unique constraint violation (user already voted)
    if ((error as any).code === 'ER_DUP_ENTRY') {
      return false;
    }
    throw error;
  }
}

export async function hasUserVotedForPet(userId: number, petId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select()
    .from(votes)
    .where(sql`${votes.userId} = ${userId} AND ${votes.petId} = ${petId}`)
    .limit(1);
  
  return result.length > 0;
}

export async function getUserVotes(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select().from(votes).where(eq(votes.userId, userId));
}

// ============ PFP Version Functions ============

export async function createPfpVersion(version: InsertPfpVersion) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Unselect all previous versions for this pet
  await db.update(pfpVersions)
    .set({ isSelected: 0 })
    .where(eq(pfpVersions.petId, version.petId));

  // Insert new version
  const result = await db.insert(pfpVersions).values(version);
  return result;
}

export async function getPfpVersionsByPetId(petId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select()
    .from(pfpVersions)
    .where(eq(pfpVersions.petId, petId))
    .orderBy(desc(pfpVersions.generationNumber));
}

export async function selectPfpVersion(versionId: number, petId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Unselect all versions for this pet
  await db.update(pfpVersions)
    .set({ isSelected: 0 })
    .where(eq(pfpVersions.petId, petId));

  // Select the chosen version
  await db.update(pfpVersions)
    .set({ isSelected: 1 })
    .where(eq(pfpVersions.id, versionId));

  // Get the selected version's image URL
  const version = await db.select()
    .from(pfpVersions)
    .where(eq(pfpVersions.id, versionId))
    .limit(1);

  if (version.length > 0) {
    // Update pet's pfpImageUrl to the selected version
    await db.update(pets)
      .set({ pfpImageUrl: version[0].imageUrl })
      .where(eq(pets.id, petId));
  }

  return version.length > 0 ? version[0] : undefined;
}

// ============ Referral Functions ============

/**
 * Generate a unique referral code for a user
 */
function generateReferralCode(userId: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars like 0/O, 1/I
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${code}${userId}`; // Add userId to ensure uniqueness
}

/**
 * Create or get user referral stats (called when user signs up)
 */
export async function getOrCreateUserReferralStats(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Check if stats already exist
  const existing = await db.select()
    .from(userReferralStats)
    .where(eq(userReferralStats.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new stats with unique referral code
  const referralCode = generateReferralCode(userId);
  
  await db.insert(userReferralStats).values({
    userId,
    referralCode,
    totalReferrals: 0,
    pendingReferrals: 0,
    freeGenerationsEarned: 0,
  });

  const newStats = await db.select()
    .from(userReferralStats)
    .where(eq(userReferralStats.userId, userId))
    .limit(1);

  return newStats[0];
}

/**
 * Track a referral click (when someone visits with ?ref=code)
 */
export async function trackReferralClick(referralCode: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Find the user who owns this referral code
  const stats = await db.select()
    .from(userReferralStats)
    .where(eq(userReferralStats.referralCode, referralCode))
    .limit(1);

  if (stats.length === 0) {
    return null; // Invalid code
  }

  const referrerId = stats[0].userId;

  // Create a pending referral record
  await db.insert(referrals).values({
    referrerId,
    referralCode,
    status: 'pending',
  });

  // Increment pending count
  await db.update(userReferralStats)
    .set({ 
      pendingReferrals: sql`${userReferralStats.pendingReferrals} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(userReferralStats.userId, referrerId));

  return referrerId;
}

/**
 * Complete a referral (when referred user signs up)
 */
export async function completeReferral(referralCode: string, newUserId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Find the most recent pending referral with this code
  const pendingReferrals = await db.select()
    .from(referrals)
    .where(sql`${referrals.referralCode} = ${referralCode} AND ${referrals.status} = 'pending'`)
    .orderBy(desc(referrals.createdAt))
    .limit(1);

  if (pendingReferrals.length === 0) {
    return null; // No pending referral found
  }

  const referral = pendingReferrals[0];
  const referrerId = referral.referrerId;

  // Update referral record
  await db.update(referrals)
    .set({
      referredUserId: newUserId,
      status: 'completed',
      completedAt: new Date(),
    })
    .where(eq(referrals.id, referral.id));

  // Update stats: increment total, decrement pending
  await db.update(userReferralStats)
    .set({
      totalReferrals: sql`${userReferralStats.totalReferrals} + 1`,
      pendingReferrals: sql`GREATEST(${userReferralStats.pendingReferrals} - 1, 0)`,
      updatedAt: new Date(),
    })
    .where(eq(userReferralStats.userId, referrerId));

  return referrerId;
}

/**
 * Grant referral reward (1 free generation per successful referral)
 */
export async function grantReferralReward(referralId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get referral
  const referralData = await db.select()
    .from(referrals)
    .where(eq(referrals.id, referralId))
    .limit(1);

  if (referralData.length === 0 || referralData[0].rewardGranted === 1) {
    return false; // Already rewarded or not found
  }

  const referral = referralData[0];
  const referrerId = referral.referrerId;

  // Mark reward as granted
  await db.update(referrals)
    .set({ 
      rewardGranted: 1,
      status: 'rewarded',
    })
    .where(eq(referrals.id, referralId));

  // Add free generation to user stats
  await db.update(userReferralStats)
    .set({
      freeGenerationsEarned: sql`${userReferralStats.freeGenerationsEarned} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(userReferralStats.userId, referrerId));

  return true;
}

/**
 * Get user's referral stats
 */
export async function getUserReferralStats(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const stats = await db.select()
    .from(userReferralStats)
    .where(eq(userReferralStats.userId, userId))
    .limit(1);

  return stats.length > 0 ? stats[0] : null;
}

/**
 * Get user's referral history
 */
export async function getUserReferrals(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select()
    .from(referrals)
    .where(eq(referrals.referrerId, userId))
    .orderBy(desc(referrals.createdAt));
}
