/**
 * Badge Router Tests
 */

import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { users, pets } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import * as badgeSystem from "./badgeSystem";
import type { TrpcContext } from "./_core/context";

describe("Badge Router", () => {
  let testUserId: number;
  let testPetId: number;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get existing user
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length === 0) {
      throw new Error("No users in database for testing");
    }
    testUserId = existingUsers[0].id;

    // Get existing pet
    const existingPets = await db.select().from(pets).where(eq(pets.userId, testUserId)).limit(1);
    if (existingPets.length === 0) {
      throw new Error("No pets in database for testing");
    }
    testPetId = existingPets[0].id;

    // Create caller with test user context
    const ctx: TrpcContext = {
      user: {
        id: testUserId,
        openId: "test-user",
        email: "test@example.com",
        name: "Test User",
        loginMethod: "manus",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    caller = appRouter.createCaller(ctx);

    // Ensure user has at least one badge for testing
    await badgeSystem.checkOGMemberBadge(testUserId);
  });

  it("should get user badges via getUserBadges", async () => {
    const result = await caller.badges.getUserBadges({ userId: testUserId });
    
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    
    // Check badge structure
    const badge = result[0];
    expect(badge).toHaveProperty("badgeId");
    expect(badge).toHaveProperty("name");
    expect(badge).toHaveProperty("icon");
    expect(badge).toHaveProperty("description");
    expect(badge).toHaveProperty("tier");
    expect(badge).toHaveProperty("earnedAt");
    expect(["milestone", "achievement", "exclusive"]).toContain(badge.tier);
  });

  it("should get pet badges via getPetBadges", async () => {
    const result = await caller.badges.getPetBadges({ petId: testPetId });
    
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    
    // Pet may or may not have badges yet
    if (result.length > 0) {
      const badge = result[0];
      expect(badge).toHaveProperty("badgeId");
      expect(badge).toHaveProperty("name");
      expect(badge).toHaveProperty("icon");
    }
  });

  it("should get current user's badges via getMyBadges", async () => {
    const result = await caller.badges.getMyBadges();
    
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    
    // Should have at least OG Member badge
    const ogBadge = result.find(b => b.name === "OG Member");
    expect(ogBadge).toBeDefined();
    expect(ogBadge?.tier).toBe("exclusive");
  });

  it("should return empty array for user with no badges", async () => {
    const result = await caller.badges.getUserBadges({ userId: 999999 });
    
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it("should return empty array for pet with no badges", async () => {
    const result = await caller.badges.getPetBadges({ petId: 999999 });
    
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it("should award badges correctly when voting", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get pet's current vote count
    const pet = await db.select().from(pets).where(eq(pets.id, testPetId)).limit(1);
    const initialVoteCount = pet[0]?.voteCount || 0;

    // Award vote milestone badges
    await badgeSystem.checkVoteMilestoneBadges(testPetId);

    // Check if appropriate badges were awarded
    const petBadges = await badgeSystem.getPetBadges(testPetId);
    
    // If pet has 5+ votes, should have Popular Pet badge
    if (initialVoteCount >= 5) {
      const popularBadge = petBadges.find(b => b.name === "Popular Pet");
      expect(popularBadge).toBeDefined();
    }
  });

  it("should award achievement badges correctly", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Check achievement badges for user
    await badgeSystem.checkAchievementBadges(testUserId);

    // Get user's badges
    const userBadges = await badgeSystem.getUserBadges(testUserId);
    
    // Should have at least one badge
    expect(userBadges.length).toBeGreaterThan(0);
    
    // Check for common achievement badges
    const badgeNames = userBadges.map(b => b.name);
    
    // User should have at least OG Member
    expect(badgeNames).toContain("OG Member");
  });
});
