import { describe, expect, it } from "vitest";
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

describe("image generation endpoints", () => {
  describe("pets.getStyles", () => {
    it("returns available image styles for public users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.pets.getStyles();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Verify structure of style objects
      result.forEach((style) => {
        expect(style).toHaveProperty("value");
        expect(style).toHaveProperty("label");
        expect(style).toHaveProperty("description");
      });
    });

    it("includes pixar style option", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.pets.getStyles();

      const pixarStyle = result.find((s) => s.value === "pixar");
      expect(pixarStyle).toBeDefined();
      expect(pixarStyle?.label).toBe("Pixar Style");
    });
  });

  describe("pets.uploadImage", () => {
    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.pets.uploadImage({
          fileName: "test.jpg",
          fileType: "image/jpeg",
          fileData: "base64data",
        })
      ).rejects.toThrow();
    });

    it("returns a URL on successful upload", async () => {
      const ctx = createAuthContext(776);
      const caller = appRouter.createCaller(ctx);

      // Create a small valid base64 image
      const validBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

      const result = await caller.pets.uploadImage({
        fileName: "test2.png",
        fileType: "image/png",
        fileData: validBase64,
      });

      expect(result.url).toMatch(/^https?:\/\//);
    });

    it("accepts valid image upload for authenticated user", async () => {
      const ctx = createAuthContext(777); // Unique user ID
      const caller = appRouter.createCaller(ctx);

      // Create a small valid base64 image (1x1 transparent PNG)
      const validBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

      const result = await caller.pets.uploadImage({
        fileName: "test.png",
        fileType: "image/png",
        fileData: validBase64,
      });

      expect(result).toHaveProperty("url");
      expect(typeof result.url).toBe("string");
      expect(result.url).toMatch(/^https?:\/\//);
    });
  });

  describe("pets.generatePFP", () => {
    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.pets.generatePFP({
          petId: 1,
          style: "pixar",
        })
      ).rejects.toThrow();
    });

    it("validates style parameter", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.pets.generatePFP({
          petId: 1,
          style: "invalid" as any,
        })
      ).rejects.toThrow();
    });

    it("rejects generation for non-existent pet", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.pets.generatePFP({
          petId: 999999,
          style: "pixar",
        })
      ).rejects.toThrow();
    });

    it("rejects generation for pet owned by another user", async () => {
      const ctx1 = createAuthContext(555); // User 1
      const caller1 = appRouter.createCaller(ctx1);

      // Create a pet as user 1
      await caller1.pets.create({
        name: "Test Pet",
        species: "Dog",
        originalImageUrl: "https://example.com/test.jpg",
      });

      const pets = await caller1.pets.myPets();
      const petId = pets[0]?.id;

      if (petId) {
        // Try to generate PFP as user 2
        const ctx2 = createAuthContext(556); // User 2
        const caller2 = appRouter.createCaller(ctx2);

        await expect(
          caller2.pets.generatePFP({
            petId,
            style: "pixar",
          })
        ).rejects.toThrow("unauthorized");
      }
    });
  });
});
