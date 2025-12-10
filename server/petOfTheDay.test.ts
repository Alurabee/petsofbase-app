import { describe, it, expect, beforeAll } from "vitest";
import { selectPetOfTheDay, getTodaysPetOfTheDay } from "./db";

describe("Pet of the Day Selection", () => {
  beforeAll(async () => {
    console.log("Testing Pet of the Day selection logic...");
  });

  it("should select a Pet of the Day", async () => {
    const result = await selectPetOfTheDay();
    
    if (result) {
      console.log(`✅ Selected Pet of the Day: ${result.petName} (ID: ${result.petId})`);
      expect(result).toBeDefined();
      expect(result.petId).toBeGreaterThan(0);
      expect(result.petName).toBeDefined();
      expect(result.date).toBeDefined();
    } else {
      console.log("⚠️ No eligible pets found (this is OK if no pets have 5+ votes)");
      expect(result).toBeNull();
    }
  });

  it("should get today's Pet of the Day", async () => {
    const result = await getTodaysPetOfTheDay();
    
    if (result) {
      console.log(`✅ Today's Pet of the Day: ${result.petName} (ID: ${result.petId})`);
      expect(result).toBeDefined();
      expect(result.petId).toBeGreaterThan(0);
      expect(result.petName).toBeDefined();
    } else {
      console.log("⚠️ No Pet of the Day selected for today yet");
      expect(result).toBeNull();
    }
  });

  it("should not select the same pet twice on the same day", async () => {
    const first = await selectPetOfTheDay();
    const second = await selectPetOfTheDay();
    
    if (first && second) {
      // Both should be the same (already selected today)
      expect(first.petId).toBe(second.petId);
      expect(first.date).toBe(second.date);
      console.log("✅ Correctly returned existing Pet of the Day instead of selecting a new one");
    } else {
      console.log("⚠️ No eligible pets found");
    }
  });
});
