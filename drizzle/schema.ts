import { integer, pgEnum, pgTable, text, timestamp, varchar, uniqueIndex, serial } from "drizzle-orm/pg-core";

/**
 * Enums
 */
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const activityTypeEnum = pgEnum("activity_type", ["generation", "mint", "vote", "top10"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Pets table - stores all pet information and NFT metadata
 */
export const pets = pgTable("pets", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(), // Owner's user ID
  ownerFid: integer("ownerFid"), // Owner's Farcaster ID from Context API
  ownerUsername: varchar("ownerUsername", { length: 255 }), // Owner's Farcaster username (without @)
  ownerDisplayName: varchar("ownerDisplayName", { length: 255 }), // Owner's Farcaster display name
  ownerPfpUrl: varchar("ownerPfpUrl", { length: 500 }), // Owner's Farcaster profile picture URL
  name: varchar("name", { length: 100 }).notNull(),
  species: varchar("species", { length: 50 }).notNull(), // Dog, Cat, Bird, etc.
  breed: varchar("breed", { length: 100 }), // Optional breed
  personality: text("personality"), // Personality traits
  likes: text("likes"), // Things the pet likes
  dislikes: text("dislikes"), // Things the pet dislikes
  originalImageUrl: varchar("originalImageUrl", { length: 500 }).notNull(), // Original uploaded photo
  pfpImageUrl: varchar("pfpImageUrl", { length: 500 }), // AI-generated PFP (null until generated)
  generationCount: integer("generationCount").default(0).notNull(), // Number of times PFP has been generated
  nftTokenId: integer("nftTokenId"), // Token ID from smart contract (null until minted)
  nftContractAddress: varchar("nftContractAddress", { length: 42 }), // Smart contract address
  nftTransactionHash: varchar("nftTransactionHash", { length: 66 }), // Minting transaction hash
  voteCount: integer("voteCount").default(0).notNull(), // Total votes received
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Pet = typeof pets.$inferSelect;
export type InsertPet = typeof pets.$inferInsert;

/**
 * Votes table - tracks user votes on pets
 * Constraint: One vote per user per pet (enforced by unique index)
 */
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(), // Voter's user ID
  petId: integer("petId").notNull(), // Pet being voted on
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  // Unique constraint: one vote per user per pet
  userPetUnique: uniqueIndex("user_pet_unique").on(table.userId, table.petId),
}));

export type Vote = typeof votes.$inferSelect;
export type InsertVote = typeof votes.$inferInsert;

/**
 * PFP Versions table - stores all generated PFP versions for each pet
 * Allows users to view history and select which version to use
 */
export const pfpVersions = pgTable("pfpVersions", {
  id: serial("id").primaryKey(),
  petId: integer("petId").notNull(), // Pet this version belongs to
  imageUrl: varchar("imageUrl", { length: 500 }).notNull(), // Storage URL of generated PFP
  prompt: text("prompt"), // AI prompt used for generation
  isSelected: integer("isSelected").default(0).notNull(), // 1 if this is the currently selected version, 0 otherwise
  generationNumber: integer("generationNumber").notNull(), // Sequential number (1, 2, 3...)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PfpVersion = typeof pfpVersions.$inferSelect;
export type InsertPfpVersion = typeof pfpVersions.$inferInsert;

/**
 * Referrals table - tracks user invitations and rewards
 */
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrerId").notNull(), // User who sent the invite
  referredUserId: integer("referredUserId"), // User who signed up (null until they sign up)
  referralCode: varchar("referralCode", { length: 50 }).notNull(), // Unique code for tracking
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, completed, rewarded
  rewardGranted: integer("rewardGranted").default(0).notNull(), // 1 if reward given, 0 otherwise
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"), // When referred user signed up
}, (table) => ({
  // Index for fast lookups
  referralCodeIndex: uniqueIndex("referral_code_unique").on(table.referralCode),
}));

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * User referral stats - aggregated data for each user
 */
export const userReferralStats = pgTable("userReferralStats", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(), // One record per user
  referralCode: varchar("referralCode", { length: 50 }).notNull().unique(), // User's personal referral code
  totalReferrals: integer("totalReferrals").default(0).notNull(), // Total successful referrals
  pendingReferrals: integer("pendingReferrals").default(0).notNull(), // Clicks but no signup yet
  freeGenerationsEarned: integer("freeGenerationsEarned").default(0).notNull(), // Bonus generations from referrals
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type UserReferralStats = typeof userReferralStats.$inferSelect;
export type InsertUserReferralStats = typeof userReferralStats.$inferInsert;

/**
 * Pet of the Day - daily featured pet with voting
 */
export const petOfTheDay = pgTable("petOfTheDay", {
  id: serial("id").primaryKey(),
  petId: integer("petId").notNull(), // Featured pet
  date: varchar("date", { length: 10 }).notNull().unique(), // YYYY-MM-DD format
  voteCount: integer("voteCount").default(0).notNull(), // Total votes for this day
  prizeAwarded: integer("prizeAwarded").default(0).notNull(), // 1 if 2 USDC prize awarded
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PetOfTheDay = typeof petOfTheDay.$inferSelect;
export type InsertPetOfTheDay = typeof petOfTheDay.$inferInsert;

/**
 * Pet of the Day Votes - tracks individual votes for daily featured pet
 */
export const petOfTheDayVotes = pgTable("petOfTheDayVotes", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(), // Voter's user ID
  petOfTheDayId: integer("petOfTheDayId").notNull(), // Reference to petOfTheDay record
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  // Unique constraint: one vote per user per day
  userDayUnique: uniqueIndex("user_day_unique").on(table.userId, table.petOfTheDayId),
}));

export type PetOfTheDayVote = typeof petOfTheDayVotes.$inferSelect;
export type InsertPetOfTheDayVote = typeof petOfTheDayVotes.$inferInsert;

/**
 * Weekly Draw - tracks weekly winners from Pet of the Day entries
 */
export const weeklyDraw = pgTable("weeklyDraw", {
  id: serial("id").primaryKey(),
  weekStartDate: varchar("weekStartDate", { length: 10 }).notNull().unique(), // Monday YYYY-MM-DD
  winningPetId: integer("winningPetId").notNull(), // Winner's pet ID
  winningPetOfTheDayId: integer("winningPetOfTheDayId").notNull(), // Reference to petOfTheDay record
  prizeAmount: integer("prizeAmount").default(5).notNull(), // Prize in USDC (500 = $5.00)
  prizeAwarded: integer("prizeAwarded").default(0).notNull(), // 1 if prize distributed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WeeklyDraw = typeof weeklyDraw.$inferSelect;
export type InsertWeeklyDraw = typeof weeklyDraw.$inferInsert;

/**
 * Activity Feed - tracks all major events for live feed
 */
export const activityFeed = pgTable("activityFeed", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(), // User who performed the action
  petId: integer("petId"), // Pet involved (if applicable)
  activityType: activityTypeEnum("activityType").notNull(),
  metadata: text("metadata"), // JSON string with additional data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityFeed = typeof activityFeed.$inferSelect;
export type InsertActivityFeed = typeof activityFeed.$inferInsert;
