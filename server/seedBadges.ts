/**
 * Seed initial badges into the database
 * Run once to populate the badges table
 */

import { getDb } from "./db";
import { badges } from "../drizzle/schema";

const INITIAL_BADGES = [
  // Tier 1: Milestone Badges (Automatic based on votes)
  {
    name: "First Steps",
    icon: "🌟",
    description: "Upload your first pet",
    tier: "milestone" as const,
    criteria: JSON.stringify({ type: "upload", threshold: 1 }),
  },
  {
    name: "Popular Pet",
    icon: "⭐",
    description: "Reach 5 votes",
    tier: "milestone" as const,
    criteria: JSON.stringify({ type: "votes", threshold: 5 }),
  },
  {
    name: "Community Favorite",
    icon: "🌠",
    description: "Reach 10 votes",
    tier: "milestone" as const,
    criteria: JSON.stringify({ type: "votes", threshold: 10 }),
  },
  {
    name: "Viral Star",
    icon: "💫",
    description: "Reach 25 votes",
    tier: "milestone" as const,
    criteria: JSON.stringify({ type: "votes", threshold: 25 }),
  },
  {
    name: "Legend",
    icon: "✨",
    description: "Reach 50 votes",
    tier: "milestone" as const,
    criteria: JSON.stringify({ type: "votes", threshold: 50 }),
  },
  {
    name: "Hall of Famer",
    icon: "🏆",
    description: "Reach 100 votes",
    tier: "milestone" as const,
    criteria: JSON.stringify({ type: "votes", threshold: 100 }),
  },

  // Tier 2: Achievement Badges (Earned through actions)
  {
    name: "Style Explorer",
    icon: "🎨",
    description: "Generate 3+ different styles",
    tier: "achievement" as const,
    criteria: JSON.stringify({ type: "generations", threshold: 3 }),
  },
  {
    name: "Perfectionist",
    icon: "🔄",
    description: "Regenerate 5+ times",
    tier: "achievement" as const,
    criteria: JSON.stringify({ type: "regenerations", threshold: 5 }),
  },
  {
    name: "Active Voter",
    icon: "🗳️",
    description: "Cast 10+ votes",
    tier: "achievement" as const,
    criteria: JSON.stringify({ type: "votes_cast", threshold: 10 }),
  },
  {
    name: "Collector",
    icon: "💎",
    description: "Mint 3+ NFTs",
    tier: "achievement" as const,
    criteria: JSON.stringify({ type: "nfts_minted", threshold: 3 }),
  },

  // Tier 3: Exclusive Badges (Special recognition)
  {
    name: "Leaderboard Royalty",
    icon: "👑",
    description: "Reach top 3 on leaderboard",
    tier: "exclusive" as const,
    criteria: JSON.stringify({ type: "leaderboard_rank", threshold: 3 }),
  },
  {
    name: "Pet of the Day",
    icon: "⭐",
    description: "Featured as daily pet",
    tier: "exclusive" as const,
    criteria: JSON.stringify({ type: "pet_of_day" }),
  },
  {
    name: "Rising Star",
    icon: "🔥",
    description: "Biggest vote gain this week",
    tier: "exclusive" as const,
    criteria: JSON.stringify({ type: "rising_star" }),
  },
  {
    name: "OG Member",
    icon: "💎",
    description: "First 100 users",
    tier: "exclusive" as const,
    criteria: JSON.stringify({ type: "early_user", threshold: 100 }),
  },
];

async function seedBadges() {
  console.log("🌱 Seeding badges...");

  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Insert all badges
    for (const badge of INITIAL_BADGES) {
      await db.insert(badges).values(badge);
      console.log(`✅ Created badge: ${badge.name} ${badge.icon}`);
    }

    console.log(`\n🎉 Successfully seeded ${INITIAL_BADGES.length} badges!`);
  } catch (error) {
    console.error("❌ Error seeding badges:", error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedBadges()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedBadges };
