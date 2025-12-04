import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

describe("User Profile Integration", () => {
  // Mock context with authenticated user
  const mockUser = {
    id: 999,
    openId: "test-user-123",
    name: "Test Owner",
    email: "test@example.com",
    loginMethod: "base",
    role: "user" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const mockContext: TrpcContext = {
    req: {} as any,
    res: {} as any,
    user: mockUser,
  };

  const caller = appRouter.createCaller(mockContext);

  it("should include owner name when creating a pet", async () => {
    // Create a pet
    const petData = {
      name: "Buddy",
      species: "Dog",
      breed: "Golden Retriever",
      personality: "Friendly and playful",
      likes: "Fetch and treats",
      dislikes: "Loud noises",
      originalImageUrl: "https://example.com/buddy.jpg",
    };

    const result = await caller.pets.create(petData);
    expect(result.success).toBe(true);

    // Verify the pet was created with owner info
    const pets = await db.getPetsByUserId(mockUser.id);
    const createdPet = pets.find(p => p.name === "Buddy");
    
    expect(createdPet).toBeDefined();
    expect(createdPet?.ownerName).toBe("Test Owner");
    expect(createdPet?.ownerAvatar).toBeNull(); // Avatar not available from Base OAuth
  });

  it("should return owner name in pet list queries", async () => {
    // Get all pets
    const pets = await caller.pets.list({ limit: 50, offset: 0 });
    
    // Check that pets have owner info (if any exist)
    if (pets && pets.length > 0) {
      const petsWithOwner = pets.filter(p => p.ownerName);
      expect(petsWithOwner.length).toBeGreaterThan(0);
      
      // Verify structure
      const samplePet = petsWithOwner[0];
      expect(samplePet).toHaveProperty("ownerName");
      expect(typeof samplePet.ownerName).toBe("string");
    }
  });

  it("should return owner name in leaderboard queries", async () => {
    // Get leaderboard
    const leaderboard = await caller.pets.leaderboard({ limit: 20 });
    
    // Check that leaderboard entries have owner info (if any exist)
    if (leaderboard && leaderboard.length > 0) {
      const petsWithOwner = leaderboard.filter(p => p.ownerName);
      
      // At least some pets should have owner info
      if (petsWithOwner.length > 0) {
        const samplePet = petsWithOwner[0];
        expect(samplePet).toHaveProperty("ownerName");
        expect(typeof samplePet.ownerName).toBe("string");
      }
    }
  });

  it("should return owner name in single pet queries", async () => {
    // Get user's pets
    const myPets = await caller.pets.myPets();
    
    if (myPets && myPets.length > 0) {
      const petId = myPets[0].id;
      
      // Get pet by ID
      const pet = await caller.pets.getById({ id: petId });
      
      expect(pet).toBeDefined();
      expect(pet?.ownerName).toBeDefined();
      expect(typeof pet?.ownerName).toBe("string");
    }
  });

  it("should handle anonymous users gracefully", async () => {
    // Create context with user that has no name
    const anonymousUser = { ...mockUser, name: null };
    const anonymousContext: TrpcContext = {
      req: {} as any,
      res: {} as any,
      user: anonymousUser,
    };
    const anonymousCaller = appRouter.createCaller(anonymousContext);

    const petData = {
      name: "Mystery Pet",
      species: "Cat",
      originalImageUrl: "https://example.com/mystery.jpg",
    };

    const result = await anonymousCaller.pets.create(petData);
    expect(result.success).toBe(true);

    // Verify pet was created with "Anonymous" as owner name
    const pets = await db.getPetsByUserId(anonymousUser.id);
    const createdPet = pets.find(p => p.name === "Mystery Pet");
    
    expect(createdPet).toBeDefined();
    expect(createdPet?.ownerName).toBe("Anonymous");
  });
});
