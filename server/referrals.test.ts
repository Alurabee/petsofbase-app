import { describe, it, expect, beforeAll } from "vitest";
import { getOrCreateUserReferralStats, trackReferralClick, completeReferral, grantReferralReward, getUserReferralStats, getUserReferrals } from "./db";

describe("Referral System", () => {
  let testUserId1: number;
  let testUserId2: number;
  let referralCode: string;

  beforeAll(async () => {
    // Use high user IDs to avoid conflicts with real data
    testUserId1 = 999001;
    testUserId2 = 999002;
  });

  it("should create referral stats for a new user", async () => {
    const stats = await getOrCreateUserReferralStats(testUserId1);
    
    expect(stats).toBeDefined();
    expect(stats.userId).toBe(testUserId1);
    expect(stats.referralCode).toBeDefined();
    expect(stats.referralCode.length).toBeGreaterThan(0);
    expect(stats.totalReferrals).toBe(0);
    expect(stats.pendingReferrals).toBe(0);
    expect(stats.freeGenerationsEarned).toBe(0);
    
    referralCode = stats.referralCode;
  });

  it("should return existing stats for a user", async () => {
    const stats1 = await getOrCreateUserReferralStats(testUserId1);
    const stats2 = await getOrCreateUserReferralStats(testUserId1);
    
    expect(stats1.referralCode).toBe(stats2.referralCode);
    expect(stats1.id).toBe(stats2.id);
  });

  it("should track a referral click", async () => {
    const referrerId = await trackReferralClick(referralCode);
    
    expect(referrerId).toBe(testUserId1);
    
    // Check that pending count increased
    const stats = await getUserReferralStats(testUserId1);
    expect(stats).toBeDefined();
    expect(stats!.pendingReferrals).toBeGreaterThan(0);
  });

  it("should return null for invalid referral code", async () => {
    const referrerId = await trackReferralClick("INVALID123");
    expect(referrerId).toBeNull();
  });

  it("should complete a referral when user signs up", async () => {
    // Create stats for the new user first
    await getOrCreateUserReferralStats(testUserId2);
    
    const referrerId = await completeReferral(referralCode, testUserId2);
    
    expect(referrerId).toBe(testUserId1);
    
    // Check that stats were updated
    const stats = await getUserReferralStats(testUserId1);
    expect(stats).toBeDefined();
    expect(stats!.totalReferrals).toBeGreaterThan(0);
  });

  it("should grant reward for completed referral", async () => {
    const referrals = await getUserReferrals(testUserId1);
    const completedReferral = referrals.find(r => r.status === 'completed' && r.rewardGranted === 0);
    
    if (completedReferral) {
      const granted = await grantReferralReward(completedReferral.id);
      expect(granted).toBe(true);
      
      // Check that free generations increased
      const stats = await getUserReferralStats(testUserId1);
      expect(stats).toBeDefined();
      expect(stats!.freeGenerationsEarned).toBeGreaterThan(0);
      
      // Check that reward can't be granted twice
      const grantedAgain = await grantReferralReward(completedReferral.id);
      expect(grantedAgain).toBe(false);
    }
  });

  it("should retrieve user referral history", async () => {
    const referrals = await getUserReferrals(testUserId1);
    
    expect(referrals).toBeDefined();
    expect(Array.isArray(referrals)).toBe(true);
    expect(referrals.length).toBeGreaterThan(0);
    
    // Check that referrals are sorted by creation date (newest first)
    if (referrals.length > 1) {
      const dates = referrals.map(r => new Date(r.createdAt).getTime());
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
      }
    }
  });
});
