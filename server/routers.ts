import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { generatePetPFP, getAvailableStyles, type PetImageStyle } from "./imageGeneration";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  pets: router({
    // Get all pets (for gallery view)
    list: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional())
      .query(async ({ input }) => {
        const { limit = 50, offset = 0 } = input || {};
        return await db.getAllPets(limit, offset);
      }),

    // Get leaderboard (top voted pets)
    leaderboard: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(50).default(20),
      }).optional())
      .query(async ({ input }) => {
        const { limit = 20 } = input || {};
        return await db.getLeaderboard(limit);
      }),

    // Get a single pet by ID
    getById: publicProcedure
      .input(z.object({
        id: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getPetById(input.id);
      }),

    // Get current user's pets
    myPets: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getPetsByUserId(ctx.user.id);
      }),

    // Create a new pet (step 1: upload info, no PFP yet)
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        species: z.string().min(1).max(50),
        breed: z.string().max(100).optional(),
        personality: z.string().optional(),
        likes: z.string().optional(),
        dislikes: z.string().optional(),
        originalImageUrl: z.string().url(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createPet({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),

    // Get available image styles
    getStyles: publicProcedure
      .query(() => {
        return getAvailableStyles();
      }),

    // Upload image to S3
    uploadImage: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileType: z.string(),
        fileData: z.string(), // Base64 encoded
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Decode base64
          const buffer = Buffer.from(input.fileData, 'base64');
          
          // Generate unique file key
          const ext = input.fileName.split('.').pop() || 'jpg';
          const fileKey = `pets/${ctx.user.id}/${nanoid()}.${ext}`;
          
          // Upload to S3
          const { url } = await storagePut(fileKey, buffer, input.fileType);
          
          return { url };
        } catch (error) {
          console.error("[Upload] Failed to upload image:", error);
          throw new Error("Failed to upload image");
        }
      }),

    // Generate PFP using AI
    generatePFP: protectedProcedure
      .input(z.object({
        petId: z.number(),
        style: z.enum(["pixar", "cartoon", "realistic", "anime", "watercolor"] as const),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get pet details
        const pet = await db.getPetById(input.petId);
        if (!pet || pet.userId !== ctx.user.id) {
          throw new Error("Pet not found or unauthorized");
        }

        // Generate PFP
        const pfpUrl = await generatePetPFP({
          petName: pet.name,
          species: pet.species,
          breed: pet.breed || undefined,
          personality: pet.personality || undefined,
          style: input.style as PetImageStyle,
          originalImageUrl: pet.originalImageUrl,
        });

        // Update pet with generated PFP
        await db.updatePet(input.petId, { pfpImageUrl: pfpUrl });

        return { pfpUrl };
      }),

    // Update pet (e.g., add generated PFP URL)
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        pfpImageUrl: z.string().url().optional(),
        nftTokenId: z.number().optional(),
        nftContractAddress: z.string().optional(),
        nftTransactionHash: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        
        // Verify ownership
        const pet = await db.getPetById(id);
        if (!pet || pet.userId !== ctx.user.id) {
          throw new Error("Pet not found or unauthorized");
        }

        await db.updatePet(id, updates);
        return { success: true };
      }),
  }),

  votes: router({
    // Vote for a pet
    vote: protectedProcedure
      .input(z.object({
        petId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const success = await db.createVote({
          userId: ctx.user.id,
          petId: input.petId,
        });

        if (!success) {
          throw new Error("You have already voted for this pet");
        }

        return { success: true };
      }),

    // Check if user has voted for a pet
    hasVoted: protectedProcedure
      .input(z.object({
        petId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.hasUserVotedForPet(ctx.user.id, input.petId);
      }),

    // Get user's votes
    myVotes: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserVotes(ctx.user.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
