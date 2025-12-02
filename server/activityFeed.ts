import { getDb } from "./db";
import { activityFeed, pets, users } from "../drizzle/schema";
import { desc, sql } from "drizzle-orm";

export type ActivityType = "generation" | "mint" | "vote" | "top10";

interface ActivityMetadata {
  petName?: string;
  petImageUrl?: string;
  userName?: string;
  rank?: number;
  voteCount?: number;
}

/**
 * Log an activity to the feed
 */
export async function logActivity(
  userId: number,
  activityType: ActivityType,
  petId?: number,
  metadata?: ActivityMetadata
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(activityFeed).values({
    userId,
    petId: petId || null,
    activityType,
    metadata: metadata ? JSON.stringify(metadata) : null,
  });
}

/**
 * Get recent activity feed with user and pet details
 */
export async function getRecentActivity(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  const activities = await db
    .select({
      id: activityFeed.id,
      userId: activityFeed.userId,
      petId: activityFeed.petId,
      activityType: activityFeed.activityType,
      metadata: activityFeed.metadata,
      createdAt: activityFeed.createdAt,
      userName: users.name,
      petName: pets.name,
      petImageUrl: pets.pfpImageUrl,
    })
    .from(activityFeed)
    .leftJoin(users, sql`${activityFeed.userId} = ${users.id}`)
    .leftJoin(pets, sql`${activityFeed.petId} = ${pets.id}`)
    .orderBy(desc(activityFeed.createdAt))
    .limit(limit);

  return activities.map(activity => ({
    ...activity,
    metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
  }));
}

/**
 * Get activity count for the last 24 hours
 */
export async function getActivityStats() {
  const db = await getDb();
  if (!db) return { generations: 0, mints: 0, votes: 0 };

  const stats = await db
    .select({
      activityType: activityFeed.activityType,
      count: sql<number>`COUNT(*)`,
    })
    .from(activityFeed)
    .where(sql`${activityFeed.createdAt} > DATE_SUB(NOW(), INTERVAL 24 HOUR)`)
    .groupBy(activityFeed.activityType);

  const result = {
    generations: 0,
    mints: 0,
    votes: 0,
  };

  stats.forEach((stat: any) => {
    if (stat.activityType === "generation") result.generations = Number(stat.count);
    if (stat.activityType === "mint") result.mints = Number(stat.count);
    if (stat.activityType === "vote") result.votes = Number(stat.count);
  });

  return result;
}
