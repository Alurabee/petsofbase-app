import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("PFP Version History", () => {
  let testPetId: number;
  let testUserId: number;

  beforeAll(async () => {
    // Create a test user
    await db.upsertUser({
      openId: "test-user-pfp-versions",
      name: "Test User",
      email: "test@example.com",
    });

    const user = await db.getUserByOpenId("test-user-pfp-versions");
    if (!user) throw new Error("Failed to create test user");
    testUserId = user.id;

    // Create a test pet
    await db.createPet({
      userId: testUserId,
      name: "Test Pet for Versions",
      species: "Dog",
      breed: "Golden Retriever",
      personality: "Friendly and playful",
      originalImageUrl: "https://example.com/test-pet.jpg",
    });

    const pets = await db.getPetsByUserId(testUserId);
    testPetId = pets[0].id;
  });

  it("should create a new PFP version", async () => {
    const version = await db.createPfpVersion({
      petId: testPetId,
      imageUrl: "https://example.com/pfp-v1.jpg",
      prompt: "pixar style Dog (Golden Retriever) with personality: Friendly and playful",
      isSelected: 1,
      generationNumber: 1,
    });

    expect(version).toBeDefined();
  });

  it("should retrieve all versions for a pet", async () => {
    // Create multiple versions
    await db.createPfpVersion({
      petId: testPetId,
      imageUrl: "https://example.com/pfp-v2.jpg",
      prompt: "cartoon style Dog (Golden Retriever) with personality: Friendly and playful",
      isSelected: 1,
      generationNumber: 2,
    });

    await db.createPfpVersion({
      petId: testPetId,
      imageUrl: "https://example.com/pfp-v3.jpg",
      prompt: "anime style Dog (Golden Retriever) with personality: Friendly and playful",
      isSelected: 1,
      generationNumber: 3,
    });

    const versions = await db.getPfpVersionsByPetId(testPetId);
    
    expect(versions.length).toBeGreaterThanOrEqual(3);
    expect(versions[0].generationNumber).toBeGreaterThan(versions[versions.length - 1].generationNumber);
  });

  it("should mark only one version as selected", async () => {
    const versions = await db.getPfpVersionsByPetId(testPetId);
    const selectedVersions = versions.filter(v => v.isSelected === 1);
    
    expect(selectedVersions.length).toBe(1);
  });

  it("should select a different version", async () => {
    const versions = await db.getPfpVersionsByPetId(testPetId);
    const firstVersion = versions[versions.length - 1]; // Oldest version
    
    const selectedVersion = await db.selectPfpVersion(firstVersion.id, testPetId);
    
    expect(selectedVersion).toBeDefined();
    expect(selectedVersion?.id).toBe(firstVersion.id);
    
    // Verify only this version is selected
    const updatedVersions = await db.getPfpVersionsByPetId(testPetId);
    const selectedVersions = updatedVersions.filter(v => v.isSelected === 1);
    
    expect(selectedVersions.length).toBe(1);
    expect(selectedVersions[0].id).toBe(firstVersion.id);
  });

  it("should update pet's pfpImageUrl when selecting a version", async () => {
    const versions = await db.getPfpVersionsByPetId(testPetId);
    const targetVersion = versions[0]; // Latest version
    
    await db.selectPfpVersion(targetVersion.id, testPetId);
    
    const pet = await db.getPetById(testPetId);
    expect(pet?.pfpImageUrl).toBe(targetVersion.imageUrl);
  });

  it("should retrieve versions via tRPC procedure", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const versions = await caller.pfpVersions.getByPetId({ petId: testPetId });
    
    expect(versions.length).toBeGreaterThanOrEqual(3);
    expect(versions[0]).toHaveProperty("imageUrl");
    expect(versions[0]).toHaveProperty("prompt");
    expect(versions[0]).toHaveProperty("generationNumber");
  });
});
