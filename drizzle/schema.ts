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
