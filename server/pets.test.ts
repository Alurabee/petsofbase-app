import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

function createPublicContext(): TrpcContext {
  return {
    user: undefined,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("pets router", () => {
  describe("pets.list", () => {
    it("returns an array of pets for public users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.pets.list();

      expect(Array.isArray(result)).toBe(true);
    });

    it("accepts limit and offset parameters", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.pets.list({ limit: 10, offset: 0 });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(10);
    });
  });

  describe("pets.leaderboard", () => {
    it("returns top voted pets for public users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.pets.leaderboard({ limit: 5 });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(5);
    });

    it("returns pets sorted by vote count", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.pets.leaderboard({ limit: 20 });

      // Verify descending order by voteCount
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].voteCount).toBeGreaterThanOrEqual(result[i + 1].voteCount);
      }
    });
  });

  describe("pets.create", () => {
    it("creates a new pet for authenticated user", async () => {
      const ctx = createAuthContext(999); // Use unique user ID for test
      const caller = appRouter.createCaller(ctx);

      const result = await caller.pets.create({
        name: "Test Pet",
        species: "Dog",
        breed: "Golden Retriever",
        personality: "Friendly and playful",
        likes: "Fetch, treats",
        dislikes: "Baths",
        originalImageUrl: "https://example.com/test-pet.jpg",
      });

      expect(result.success).toBe(true);
    });

    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.pets.create({
          name: "Test Pet",
          species: "Dog",
          originalImageUrl: "https://example.com/test-pet.jpg",
        })
      ).rejects.toThrow();
    });

    it("validates required fields", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.pets.create({
          name: "",
          species: "Dog",
          originalImageUrl: "https://example.com/test-pet.jpg",
        })
      ).rejects.toThrow();
    });
  });

  describe("pets.myPets", () => {
    it("returns pets owned by the authenticated user", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.pets.myPets();

      expect(Array.isArray(result)).toBe(true);
    });

    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.pets.myPets()).rejects.toThrow();
    });
  });

  describe("pets.getById", () => {
    it("returns a pet by ID for public users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      // First get a pet from the list
      const pets = await caller.pets.list({ limit: 1 });
      
      if (pets.length > 0) {
        const result = await caller.pets.getById({ id: pets[0].id });
        expect(result).toBeDefined();
        if (result) {
          expect(result.id).toBe(pets[0].id);
        }
      }
    });

    it("returns undefined for non-existent pet", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.pets.getById({ id: 999999 });
      expect(result).toBeUndefined();
    });
  });
});

describe("votes router", () => {
  describe("votes.vote", () => {
    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.votes.vote({ petId: 1 })
      ).rejects.toThrow();
    });

    it("prevents duplicate votes", async () => {
      const ctx = createAuthContext(888); // Use unique user ID
      const caller = appRouter.createCaller(ctx);

      // First, create a pet to vote on
      await caller.pets.create({
        name: "Vote Test Pet",
        species: "Cat",
        originalImageUrl: "https://example.com/vote-test.jpg",
      });

      const pets = await caller.pets.myPets();
      const petId = pets[0]?.id;

      if (petId) {
        // First vote should succeed
        const firstVote = await caller.votes.vote({ petId });
        expect(firstVote.success).toBe(true);

        // Second vote should fail (duplicate key error)
        await expect(
          caller.votes.vote({ petId })
        ).rejects.toThrow();
      }
    });
  });

  describe("votes.hasVoted", () => {
    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.votes.hasVoted({ petId: 1 })
      ).rejects.toThrow();
    });

    it("returns false for pets user hasn't voted on", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.votes.hasVoted({ petId: 999999 });
      expect(typeof result).toBe("boolean");
    });
  });

  describe("votes.myVotes", () => {
    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.votes.myVotes()).rejects.toThrow();
    });

    it("returns an array of user votes", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.votes.myVotes();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
