import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { getPetById, updatePet } from "./db";
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
      .input(z.object({ petId: z.number(), style: z.enum(["pixar", "cartoon", "realistic", "anime", "watercolor"]) }))
      .mutation(async ({ input, ctx }) => {
        const pet = await getPetById(input.petId);
        if (!pet) throw new TRPCError({ code: "NOT_FOUND", message: "Pet not found" });
        if (pet.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not your pet" });
        }

        // Check generation limit (2 free generations per pet)
        const FREE_GENERATION_LIMIT = 2;
        const currentCount = pet.generationCount || 0;
        
        if (currentCount >= FREE_GENERATION_LIMIT) {
          throw new TRPCError({ 
            code: "PAYMENT_REQUIRED", 
            message: `Generation limit reached. You have used ${currentCount}/${FREE_GENERATION_LIMIT} free generations. Please pay $0.10 USDC to generate more.` 
          });
        }

        const pfpImageUrl = await generatePetPFP({
          petName: pet.name,
          species: pet.species,
          breed: pet.breed || undefined,
          personality: pet.personality || undefined,
          style: input.style,
          originalImageUrl: pet.originalImageUrl,
        });

        // Increment generation count
        const newCount = currentCount + 1;
        
        // Save this version to pfpVersions table
        const prompt = `${input.style} style ${pet.species}${pet.breed ? ` (${pet.breed})` : ''} with personality: ${pet.personality || 'friendly'}`;
        await db.createPfpVersion({
          petId: input.petId,
          imageUrl: pfpImageUrl,
          prompt,
          isSelected: 1, // Mark as selected by default
          generationNumber: newCount,
        });
        
        // Update pet with latest PFP
        await updatePet(input.petId, { pfpImageUrl, generationCount: newCount });
        
        return { 
          success: true, 
          pfpImageUrl, 
          generationCount: newCount,
          remainingFreeGenerations: Math.max(0, FREE_GENERATION_LIMIT - newCount)
        };
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

  pfpVersions: router({
    // Get all versions for a pet
    getByPetId: publicProcedure
      .input(z.object({
        petId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getPfpVersionsByPetId(input.petId);
      }),

    // Select a specific version as the active PFP
    selectVersion: protectedProcedure
      .input(z.object({
        versionId: z.number(),
        petId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify ownership
        const pet = await db.getPetById(input.petId);
        if (!pet || pet.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not your pet" });
        }

        const selectedVersion = await db.selectPfpVersion(input.versionId, input.petId);
        return { success: true, selectedVersion };
      }),
  }),
});

export type AppRouter = typeof appRouter;
