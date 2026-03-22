import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { friendships, referralCodes, referralSignups, referralDevices, users, userProfiles, workoutSessions } from "../../drizzle/schema";
import { eq, and, desc, or, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import z from "zod";
import crypto from "crypto";

// Helper: Hash IP for privacy
function hashIP(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex");
}

// Helper: Generate device ID (browser fingerprint)
function generateDeviceId(userAgent: string, acceptLanguage: string): string {
  const fingerprint = `${userAgent}|${acceptLanguage}`;
  return crypto.createHash("sha256").update(fingerprint).digest("hex");
}

// Helper: Check if signup is valid (anti-cheat)
async function validateSignup(db: any, newUserId: number, referrerId: number, deviceId: string): Promise<boolean> {
  // Rule 1: Different devices (prevent same device fraud)
  const sameDeviceCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(referralSignups)
    .where(and(eq(referralSignups.referrerId, referrerId), eq(referralSignups.deviceId, deviceId)));

  if ((sameDeviceCount[0]?.count as number) > 0) return false;

  // Rule 2: Minimum activity - user must have at least 1 workout or nutrition log
  const workoutCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(workoutSessions)
    .where(eq(workoutSessions.userId, newUserId));

  if ((workoutCount[0]?.count as number) === 0) {
    // Check in 24 hours - if still no activity, mark invalid
    return false;
  }

  // Rule 3: Account age - must be at least 24 hours old (checked later)
  const userProfile = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, newUserId))
    .limit(1);

  if (userProfile.length === 0) return false;

  const accountAge = Date.now() - userProfile[0].createdAt.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  if (accountAge < oneDayMs) return false;

  return true;
}

// Helper: Award premium based on tier
async function awardPremium(db: any, userId: number, days: number) {
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  await db
    .update(userProfiles)
    .set({
      isPremium: true,
      premiumExpiresAt: expiresAt,
    })
    .where(eq(userProfiles.userId, userId));
}

export const friendsRouter = router({
  // Get list of friends (accepted friendships)
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const result = await db
      .select({
        id: friendships.id,
        friendId: friendships.friendId,
        status: friendships.status,
        name: users.name,
        email: users.email,
        createdAt: friendships.createdAt,
        acceptedAt: friendships.acceptedAt,
      })
      .from(friendships)
      .leftJoin(users, eq(friendships.friendId, users.id))
      .where(and(eq(friendships.userId, ctx.user.id), eq(friendships.status, "accepted")))
      .orderBy(desc(friendships.acceptedAt));
    return result;
  }),

  // Get pending friend requests
  getPending: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select({
        id: friendships.id,
        friendId: friendships.friendId,
        name: users.name,
        email: users.email,
        createdAt: friendships.createdAt,
      })
      .from(friendships)
      .leftJoin(users, eq(friendships.friendId, users.id))
      .where(and(eq(friendships.userId, ctx.user.id), eq(friendships.status, "pending")))
      .orderBy(desc(friendships.createdAt));
  }),

  // Send friend request
  sendRequest: protectedProcedure
    .input(z.object({ friendId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      if (input.friendId === ctx.user.id) throw new Error("Cannot add yourself");

      const existing = await db
        .select()
        .from(friendships)
        .where(
          or(
            and(eq(friendships.userId, ctx.user.id), eq(friendships.friendId, input.friendId)),
            and(eq(friendships.userId, input.friendId), eq(friendships.friendId, ctx.user.id))
          )
        )
        .limit(1);

      if (existing.length > 0) return { success: false, message: "Already connected" };

      await db.insert(friendships).values({
        userId: ctx.user.id,
        friendId: input.friendId,
        status: "pending",
      });

      return { success: true };
    }),

  // Accept friend request
  acceptRequest: protectedProcedure
    .input(z.object({ friendshipId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      await db
        .update(friendships)
        .set({ status: "accepted", acceptedAt: new Date() })
        .where(and(eq(friendships.id, input.friendshipId), eq(friendships.userId, ctx.user.id)));

      return { success: true };
    }),

  // Remove friend
  remove: protectedProcedure
    .input(z.object({ friendId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      await db
        .delete(friendships)
        .where(
          or(
            and(eq(friendships.userId, ctx.user.id), eq(friendships.friendId, input.friendId)),
            and(eq(friendships.userId, input.friendId), eq(friendships.friendId, ctx.user.id))
          )
        );

      return { success: true };
    }),

  // Generate referral code
  generateReferralCode: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");

    const existing = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.userId, ctx.user.id))
      .limit(1);

    if (existing.length > 0) {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://vyro.app";
      return { code: existing[0].code, url: `${baseUrl}/onboarding?ref=${existing[0].code}` };
    }

    const code = nanoid(8).toUpperCase();
    await db.insert(referralCodes).values({
      userId: ctx.user.id,
      code,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://vyro.app";
    return { code, url: `${baseUrl}/onboarding?ref=${code}` };
  }),

  // Get referral code
  getReferralCode: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.userId, ctx.user.id))
      .limit(1);
    if (result.length === 0) return null;
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://vyro.app";
    return { code: result[0].code, url: `${baseUrl}/onboarding?ref=${result[0].code}` };
  }),

  // Track referral signup with anti-cheat
  trackReferralSignup: protectedProcedure
    .input(z.object({ referralCode: z.string(), userAgent: z.string(), acceptLanguage: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      // Find the referral code
      const codeRecord = await db
        .select()
        .from(referralCodes)
        .where(eq(referralCodes.code, input.referralCode))
        .limit(1);

      if (codeRecord.length === 0) return { success: false, message: "Invalid referral code" };

      const code = codeRecord[0];
      const referrerId = code.userId;
      const deviceId = generateDeviceId(input.userAgent, input.acceptLanguage);

      // Record the signup
      await db.insert(referralSignups).values({
        referralCodeId: code.id,
        newUserId: ctx.user.id,
        referrerId,
        deviceId,
        isValid: false,
      });

      // Increment usedCount
      await db
        .update(referralCodes)
        .set({ usedCount: sql`usedCount + 1` })
        .where(eq(referralCodes.id, code.id));

      // Store device info
      await db
        .insert(referralDevices)
        .values({
          userId: ctx.user.id,
          deviceId,
          deviceName: input.userAgent.substring(0, 255),
        })
        .onDuplicateKeyUpdate({ set: { userId: ctx.user.id } });

      return { success: true, message: "Referral tracked. Complete your first workout to validate!" };
    }),

  // Validate referral signup (called after user completes activity)
  validateReferralSignup: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");

    // Find pending signups for this user
    const pendingSignups = await db
      .select()
      .from(referralSignups)
      .where(and(eq(referralSignups.newUserId, ctx.user.id), eq(referralSignups.isValid, false)));

    for (const signup of pendingSignups) {
      const isValid = await validateSignup(db, ctx.user.id, signup.referrerId, signup.deviceId);

      if (isValid) {
        // Mark as valid
        await db
          .update(referralSignups)
          .set({ isValid: true, validatedAt: new Date() })
          .where(eq(referralSignups.id, signup.id));

        // Increment validSignups
        await db
          .update(referralCodes)
          .set({ validSignups: sql`validSignups + 1` })
          .where(eq(referralCodes.id, signup.referralCodeId));

        // Check for tier rewards
        const codeRecord = await db
          .select()
          .from(referralCodes)
          .where(eq(referralCodes.id, signup.referralCodeId))
          .limit(1);

        if (codeRecord.length > 0) {
          const updatedCode = codeRecord[0];

          // Tier 1: 3 signups = 2 weeks premium
          if (updatedCode.validSignups === 3 && !updatedCode.tier3ClaimedAt) {
            await awardPremium(db, signup.referrerId, 14);
            await awardPremium(db, ctx.user.id, 7);

            // Award to other 2 referred users
            const otherReferrals = await db
              .select({ newUserId: referralSignups.newUserId })
              .from(referralSignups)
              .where(
                and(
                  eq(referralSignups.referrerId, signup.referrerId),
                  eq(referralSignups.isValid, true),
                  sql`newUserId != ${ctx.user.id}`
                )
              )
              .limit(2);

            for (const ref of otherReferrals) {
              await awardPremium(db, ref.newUserId, 7);
            }

            await db
              .update(referralCodes)
              .set({ tier3ClaimedAt: new Date() })
              .where(eq(referralCodes.id, signup.referralCodeId));

            return { success: true, tier: 3, message: "🎉 Tier 1 unlocked! 2 weeks premium for you + 1 week for your friends!" };
          }

          // Tier 2: 5 signups = 1 month premium
          if (updatedCode.validSignups === 5 && !updatedCode.tier5ClaimedAt) {
            await awardPremium(db, signup.referrerId, 30);

            const referrals = await db
              .select({ newUserId: referralSignups.newUserId })
              .from(referralSignups)
              .where(and(eq(referralSignups.referrerId, signup.referrerId), eq(referralSignups.isValid, true)))
              .limit(5);

            for (const ref of referrals) {
              await awardPremium(db, ref.newUserId, 14);
            }

            await db
              .update(referralCodes)
              .set({ tier5ClaimedAt: new Date() })
              .where(eq(referralCodes.id, signup.referralCodeId));

            return { success: true, tier: 5, message: "🚀 Tier 2 unlocked! 1 month premium for you + 2 weeks for your friends!" };
          }

          // Tier 3: 10 signups = 3 months premium
          if (updatedCode.validSignups === 10 && !updatedCode.tier10ClaimedAt) {
            await awardPremium(db, signup.referrerId, 90);

            const referrals = await db
              .select({ newUserId: referralSignups.newUserId })
              .from(referralSignups)
              .where(and(eq(referralSignups.referrerId, signup.referrerId), eq(referralSignups.isValid, true)))
              .limit(10);

            for (const ref of referrals) {
              await awardPremium(db, ref.newUserId, 30);
            }

            await db
              .update(referralCodes)
              .set({ tier10ClaimedAt: new Date() })
              .where(eq(referralCodes.id, signup.referralCodeId));

            return { success: true, tier: 10, message: "👑 Tier 3 unlocked! 3 months premium for you + 1 month for your friends!" };
          }
        }
      }
    }

    return { success: true, tier: 0, message: "Referral validation in progress" };
  }),

  // Get referral stats
  getReferralStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const codeRecord = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.userId, ctx.user.id))
      .limit(1);

    if (codeRecord.length === 0) return { validSignups: 0, tier3: false, tier5: false, tier10: false };

    const code = codeRecord[0];

    return {
      validSignups: code.validSignups,
      tier3: !!code.tier3ClaimedAt,
      tier5: !!code.tier5ClaimedAt,
      tier10: !!code.tier10ClaimedAt,
    };
  }),

  // Get referral details for display
  getReferralDetails: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const codeRecord = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.userId, ctx.user.id))
      .limit(1);

    if (codeRecord.length === 0) return null;

    const code = codeRecord[0];

    const signups = await db
      .select({
        id: referralSignups.id,
        newUserId: referralSignups.newUserId,
        isValid: referralSignups.isValid,
        createdAt: referralSignups.createdAt,
        name: users.name,
      })
      .from(referralSignups)
      .leftJoin(users, eq(referralSignups.newUserId, users.id))
      .where(eq(referralSignups.referralCodeId, code.id));

    return {
      code: code.code,
      validSignups: code.validSignups,
      totalSignups: code.usedCount,
      tier3: !!code.tier3ClaimedAt,
      tier5: !!code.tier5ClaimedAt,
      tier10: !!code.tier10ClaimedAt,
      signups,
    };
  }),
});
