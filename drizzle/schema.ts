import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, uniqueIndex } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Pets table - stores all pet information and NFT metadata
 */
export const pets = mysqlTable("pets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Owner's user ID
  name: varchar("name", { length: 100 }).notNull(),
  species: varchar("species", { length: 50 }).notNull(), // Dog, Cat, Bird, etc.
  breed: varchar("breed", { length: 100 }), // Optional breed
  personality: text("personality"), // Personality traits
  likes: text("likes"), // Things the pet likes
  dislikes: text("dislikes"), // Things the pet dislikes
  originalImageUrl: varchar("originalImageUrl", { length: 500 }).notNull(), // Original uploaded photo
  pfpImageUrl: varchar("pfpImageUrl", { length: 500 }), // AI-generated PFP (null until generated)
  generationCount: int("generationCount").default(0).notNull(), // Number of times PFP has been generated
  nftTokenId: int("nftTokenId"), // Token ID from smart contract (null until minted)
  nftContractAddress: varchar("nftContractAddress", { length: 42 }), // Smart contract address
  nftTransactionHash: varchar("nftTransactionHash", { length: 66 }), // Minting transaction hash
  voteCount: int("voteCount").default(0).notNull(), // Total votes received
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Pet = typeof pets.$inferSelect;
export type InsertPet = typeof pets.$inferInsert;

/**
 * Votes table - tracks user votes on pets
 * Constraint: One vote per user per pet (enforced by unique index)
 */
export const votes = mysqlTable("votes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Voter's user ID
  petId: int("petId").notNull(), // Pet being voted on
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
export const pfpVersions = mysqlTable("pfpVersions", {
  id: int("id").autoincrement().primaryKey(),
  petId: int("petId").notNull(), // Pet this version belongs to
  imageUrl: varchar("imageUrl", { length: 500 }).notNull(), // S3 URL of generated PFP
  prompt: text("prompt"), // AI prompt used for generation
  isSelected: int("isSelected").default(0).notNull(), // 1 if this is the currently selected version, 0 otherwise
  generationNumber: int("generationNumber").notNull(), // Sequential number (1, 2, 3...)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PfpVersion = typeof pfpVersions.$inferSelect;
export type InsertPfpVersion = typeof pfpVersions.$inferInsert;

/**
 * Referrals table - tracks user invitations and rewards
 */
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: int("referrerId").notNull(), // User who sent the invite
  referredUserId: int("referredUserId"), // User who signed up (null until they sign up)
  referralCode: varchar("referralCode", { length: 50 }).notNull(), // Unique code for tracking
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, completed, rewarded
  rewardGranted: int("rewardGranted").default(0).notNull(), // 1 if reward given, 0 otherwise
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
export const userReferralStats = mysqlTable("userReferralStats", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(), // One record per user
  referralCode: varchar("referralCode", { length: 50 }).notNull().unique(), // User's personal referral code
  totalReferrals: int("totalReferrals").default(0).notNull(), // Total successful referrals
  pendingReferrals: int("pendingReferrals").default(0).notNull(), // Clicks but no signup yet
  freeGenerationsEarned: int("freeGenerationsEarned").default(0).notNull(), // Bonus generations from referrals
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type UserReferralStats = typeof userReferralStats.$inferSelect;
export type InsertUserReferralStats = typeof userReferralStats.$inferInsert;

/**
 * Pet of the Day - daily featured pet with voting
 */
export const petOfTheDay = mysqlTable("petOfTheDay", {
  id: int("id").autoincrement().primaryKey(),
  petId: int("petId").notNull(), // Featured pet
  date: varchar("date", { length: 10 }).notNull().unique(), // YYYY-MM-DD format
  voteCount: int("voteCount").default(0).notNull(), // Total votes for this day
  prizeAwarded: int("prizeAwarded").default(0).notNull(), // 1 if 2 USDC prize awarded
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PetOfTheDay = typeof petOfTheDay.$inferSelect;
export type InsertPetOfTheDay = typeof petOfTheDay.$inferInsert;

/**
 * Pet of the Day Votes - tracks individual votes for daily featured pet
 */
export const petOfTheDayVotes = mysqlTable("petOfTheDayVotes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Voter's user ID
  petOfTheDayId: int("petOfTheDayId").notNull(), // Reference to petOfTheDay record
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
export const weeklyDraw = mysqlTable("weeklyDraw", {
  id: int("id").autoincrement().primaryKey(),
  weekStartDate: varchar("weekStartDate", { length: 10 }).notNull().unique(), // Monday YYYY-MM-DD
  winningPetId: int("winningPetId").notNull(), // Winner's pet ID
  winningPetOfTheDayId: int("winningPetOfTheDayId").notNull(), // Reference to petOfTheDay record
  prizeAmount: int("prizeAmount").default(5).notNull(), // Prize in USDC (500 = $5.00)
  prizeAwarded: int("prizeAwarded").default(0).notNull(), // 1 if prize distributed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WeeklyDraw = typeof weeklyDraw.$inferSelect;
export type InsertWeeklyDraw = typeof weeklyDraw.$inferInsert;

/**
 * Activity Feed - tracks all major events for live feed
 */
export const activityFeed = mysqlTable("activityFeed", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // User who performed the action
  petId: int("petId"), // Pet involved (if applicable)
  activityType: mysqlEnum("activityType", ["generation", "mint", "vote", "top10"]).notNull(),
  metadata: text("metadata"), // JSON string with additional data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityFeed = typeof activityFeed.$inferSelect;
export type InsertActivityFeed = typeof activityFeed.$inferInsert;
