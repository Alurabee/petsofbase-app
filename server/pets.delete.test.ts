import { describe, it, expect, beforeEach } from "vitest";
import * as db from "./db";
import { getDb } from "./db";
import { pets, pfpVersions, votes } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Delete Pet Functionality", () => {
  let testUserId: number;
  let otherUserId: number;
  let testPetId: number;
  let mintedPetId: number;

  beforeEach(async () => {
    // Create test users
    testUserId = 1;
    otherUserId = 2;

    // Create a test pet (not minted)
    await db.createPet({
      userId: testUserId,
      name: "Test Pet",
      species: "dog",
      breed: "Labrador",
      personality: "friendly",
      originalImageUrl: "https://example.com/test.jpg",
    });

    const database = await getDb();
    if (!database) throw new Error("Database not available");

    const createdPets = await database
      .select()
      .from(pets)
      .where(eq(pets.userId, testUserId))
      .orderBy(pets.id);
    testPetId = createdPets[createdPets.length - 1].id;

    // Create a minted pet
    await db.createPet({
      userId: testUserId,
      name: "Minted Pet",
      species: "cat",
      originalImageUrl: "https://example.com/minted.jpg",
    });

    const allPets = await database
      .select()
      .from(pets)
      .where(eq(pets.userId, testUserId))
      .orderBy(pets.id);
    mintedPetId = allPets[allPets.length - 1].id;

    // Mark as minted
    await db.updatePet(mintedPetId, {
      nftTokenId: 123,
      nftContractAddress: "0x1234567890",
    });

    // Add PFP version to test pet
    await db.createPfpVersion({
      petId: testPetId,
      imageUrl: "https://example.com/pfp.jpg",
      prompt: "Test prompt",
      generationNumber: 1,
      isSelected: true,
    });

    // Add vote to test pet
    await db.createVote({
      userId: testUserId,
      petId: testPetId,
    });
  });

  it("should successfully delete a non-minted pet", async () => {
    const result = await db.deletePet(testPetId, testUserId);
    expect(result).toBe(true);

    // Verify pet is deleted
    const pet = await db.getPetById(testPetId);
    expect(pet).toBeUndefined();
  });

  it("should delete associated PFP versions when deleting pet", async () => {
    await db.deletePet(testPetId, testUserId);

    const database = await getDb();
    if (!database) throw new Error("Database not available");

    const versions = await database
      .select()
      .from(pfpVersions)
      .where(eq(pfpVersions.petId, testPetId));

    expect(versions.length).toBe(0);
  });

  it("should delete associated votes when deleting pet", async () => {
    await db.deletePet(testPetId, testUserId);

    const database = await getDb();
    if (!database) throw new Error("Database not available");

    const petVotes = await database
      .select()
      .from(votes)
      .where(eq(votes.petId, testPetId));

    expect(petVotes.length).toBe(0);
  });

  it("should throw error when trying to delete another user's pet", async () => {
    await expect(db.deletePet(testPetId, otherUserId)).rejects.toThrow(
      "Unauthorized: You can only delete your own pets"
    );
  });

  it("should throw error when trying to delete a minted NFT", async () => {
    await expect(db.deletePet(mintedPetId, testUserId)).rejects.toThrow(
      "Cannot delete minted NFTs"
    );
  });

  it("should throw error when trying to delete non-existent pet", async () => {
    await expect(db.deletePet(99999, testUserId)).rejects.toThrow(
      "Pet not found"
    );
  });
});
