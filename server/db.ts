import { eq, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, pets, votes, InsertPet, InsertVote } from "../drizzle/schema";
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
