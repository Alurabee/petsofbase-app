import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

const roleEnum = pgEnum("role", ["user", "admin"]);
const activityTypeEnum = pgEnum("activityType", ["generation", "mint", "vote", "top10"]);
const badgeTierEnum = pgEnum("tier", ["milestone", "achievement", "exclusive"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  // Postgres has no ON UPDATE clause; update in application code if needed.
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
  ownerUsername: varchar("ownerUsername", { length: 255 }),
  ownerDisplayName: varchar("ownerDisplayName", { length: 255 }),
  ownerPfpUrl: varchar("ownerPfpUrl", { length: 500 }),
  name: varchar("name", { length: 100 }).notNull(),
  species: varchar("species", { length: 50 }).notNull(),
  breed: varchar("breed", { length: 100 }),
  personality: text("personality"),
  likes: text("likes"),
  dislikes: text("dislikes"),
  originalImageUrl: varchar("originalImageUrl", { length: 500 }).notNull(),
  pfpImageUrl: varchar("pfpImageUrl", { length: 500 }),
  generationCount: integer("generationCount").default(0).notNull(),
  nftTokenId: integer("nftTokenId"),
  nftContractAddress: varchar("nftContractAddress", { length: 42 }),
  nftTransactionHash: varchar("nftTransactionHash", { length: 66 }),
  voteCount: integer("voteCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Pet = typeof pets.$inferSelect;
export type InsertPet = typeof pets.$inferInsert;

/**
 * Votes table - tracks user votes on pets
 */
export const votes = pgTable(
  "votes",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull(),
    petId: integer("petId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    userPetUnique: uniqueIndex("user_pet_unique").on(table.userId, table.petId),
  })
);

export type Vote = typeof votes.$inferSelect;
export type InsertVote = typeof votes.$inferInsert;

/**
 * PFP Versions table - stores all generated PFP versions for each pet
 */
export const pfpVersions = pgTable("pfpVersions", {
  id: serial("id").primaryKey(),
  petId: integer("petId").notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }).notNull(),
  prompt: text("prompt"),
  isSelected: integer("isSelected").default(0).notNull(),
  generationNumber: integer("generationNumber").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PfpVersion = typeof pfpVersions.$inferSelect;
export type InsertPfpVersion = typeof pfpVersions.$inferInsert;

/**
 * Referrals table - tracks user invitations and rewards
 */
export const referrals = pgTable(
  "referrals",
  {
    id: serial("id").primaryKey(),
    referrerId: integer("referrerId").notNull(),
    referredUserId: integer("referredUserId"),
    referralCode: varchar("referralCode", { length: 50 }).notNull(),
    status: varchar("status", { length: 20 }).default("pending").notNull(),
    rewardGranted: integer("rewardGranted").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    completedAt: timestamp("completedAt"),
  },
  table => ({
    referralCodeIndex: uniqueIndex("referral_code_unique").on(table.referralCode),
  })
);

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * User referral stats - aggregated data for each user
 */
export const userReferralStats = pgTable("userReferralStats", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  referralCode: varchar("referralCode", { length: 50 }).notNull().unique(),
  totalReferrals: integer("totalReferrals").default(0).notNull(),
  pendingReferrals: integer("pendingReferrals").default(0).notNull(),
  freeGenerationsEarned: integer("freeGenerationsEarned").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type UserReferralStats = typeof userReferralStats.$inferSelect;
export type InsertUserReferralStats = typeof userReferralStats.$inferInsert;

/**
 * Pet of the Day - daily featured pet with voting
 */
export const petOfTheDay = pgTable("petOfTheDay", {
  id: serial("id").primaryKey(),
  petId: integer("petId").notNull(),
  date: varchar("date", { length: 10 }).notNull().unique(),
  voteCount: integer("voteCount").default(0).notNull(),
  prizeAwarded: integer("prizeAwarded").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PetOfTheDay = typeof petOfTheDay.$inferSelect;
export type InsertPetOfTheDay = typeof petOfTheDay.$inferInsert;

/**
 * Pet of the Day Votes - tracks individual votes for daily featured pet
 */
export const petOfTheDayVotes = pgTable(
  "petOfTheDayVotes",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull(),
    petOfTheDayId: integer("petOfTheDayId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    userDayUnique: uniqueIndex("user_day_unique").on(table.userId, table.petOfTheDayId),
  })
);

export type PetOfTheDayVote = typeof petOfTheDayVotes.$inferSelect;
export type InsertPetOfTheDayVote = typeof petOfTheDayVotes.$inferInsert;

/**
 * Weekly Draw - tracks weekly winners from Pet of the Day entries
 */
export const weeklyDraw = pgTable("weeklyDraw", {
  id: serial("id").primaryKey(),
  weekStartDate: varchar("weekStartDate", { length: 10 }).notNull().unique(),
  winningPetId: integer("winningPetId").notNull(),
  winningPetOfTheDayId: integer("winningPetOfTheDayId").notNull(),
  prizeAmount: integer("prizeAmount").default(5).notNull(),
  prizeAwarded: integer("prizeAwarded").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WeeklyDraw = typeof weeklyDraw.$inferSelect;
export type InsertWeeklyDraw = typeof weeklyDraw.$inferInsert;

/**
 * Activity Feed - tracks all major events for live feed
 */
export const activityFeed = pgTable("activityFeed", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  petId: integer("petId"),
  activityType: activityTypeEnum("activityType").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityFeed = typeof activityFeed.$inferSelect;
export type InsertActivityFeed = typeof activityFeed.$inferInsert;

/**
 * Badges - defines all available badges in the system
 */
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 10 }).notNull(),
  description: text("description").notNull(),
  tier: badgeTierEnum("tier").notNull(),
  criteria: text("criteria").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

/**
 * User Badges - tracks which badges users have earned
 */
export const userBadges = pgTable(
  "userBadges",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull(),
    petId: integer("petId"),
    badgeId: integer("badgeId").notNull(),
    earnedAt: timestamp("earnedAt").defaultNow().notNull(),
  },
  table => ({
    userPetBadgeUnique: uniqueIndex("user_pet_badge_unique").on(
      table.userId,
      table.petId,
      table.badgeId
    ),
  })
);

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;
