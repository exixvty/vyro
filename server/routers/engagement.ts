import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { userXP, dailyGoals, userAchievements, loginStreaks, beastMode } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

const TIER_THRESHOLDS = {
  Rookie: 0,
  Prospect: 500,
  Athlete: 1500,
  Beast: 3500,
  Elite: 7000,
  Legend: 12000,
};

const TIER_NAMES = ["Rookie", "Prospect", "Athlete", "Beast", "Elite", "Legend"] as const;

function calculateTier(totalXP: number): (typeof TIER_NAMES)[number] {
  for (let i = TIER_NAMES.length - 1; i >= 0; i--) {
    if (totalXP >= TIER_THRESHOLDS[TIER_NAMES[i]]) {
      return TIER_NAMES[i];
    }
  }
  return "Rookie";
}

function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / 500) + 1;
}

export const engagementRouter = router({
  // Get user XP and tier
  getXP: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(userXP)
      .where(eq(userXP.userId, ctx.user.id))
      .limit(1);

    return result[0] || null;
  }),

  // Add XP to user
  addXP: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(1),
        reason: z.enum(["workout", "meal", "streak", "activity", "daily_goal_bonus"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;

      // Get current XP
      const current = await db
        .select()
        .from(userXP)
        .where(eq(userXP.userId, ctx.user.id))
        .limit(1);

      const currentXP = current[0]?.totalXP || 0;
      const newTotalXP = currentXP + input.amount;
      const newLevel = calculateLevel(newTotalXP);
      const newTier = calculateTier(newTotalXP);
      const oldLevel = calculateLevel(currentXP);
      const oldTier = calculateTier(currentXP);

      // Update or create XP record
      if (current[0]) {
        await db
          .update(userXP)
          .set({
            totalXP: newTotalXP,
            currentLevel: newLevel,
            currentTier: newTier,
            lastLevelUpAt: newLevel > oldLevel ? new Date() : current[0].lastLevelUpAt,
          })
          .where(eq(userXP.userId, ctx.user.id));
      } else {
        await db.insert(userXP).values({
          userId: ctx.user.id,
          totalXP: newTotalXP,
          currentLevel: newLevel,
          currentTier: newTier,
        });
      }

      // Check for level up achievement
      if (newLevel > oldLevel) {
        await db.insert(userAchievements).values({
          userId: ctx.user.id,
          achievementType: "first_level_up",
        });
      }

      return {
        totalXP: newTotalXP,
        level: newLevel,
        tier: newTier,
        leveledUp: newLevel > oldLevel,
        tierChanged: newTier !== oldTier,
        oldLevel,
        oldTier,
        xpGained: input.amount,
      };
    }),

  // Get today's daily goals
  getTodayGoals: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const today = new Date().toISOString().split("T")[0];
    const result = await db
      .select()
      .from(dailyGoals)
      .where(and(eq(dailyGoals.userId, ctx.user.id), eq(dailyGoals.date, today)))
      .limit(1);

    if (result[0]) {
      return result[0];
    }

    // Create today's goals if they don't exist
    await db.insert(dailyGoals).values({
      userId: ctx.user.id,
      date: today,
    });

    return { userId: ctx.user.id, date: today, workoutCompleted: false, mealsLogged: false, activityCompleted: false };
  }),

  // Mark daily goal as complete
  completeGoal: protectedProcedure
    .input(z.object({ goalType: z.enum(["workoutCompleted", "mealsLogged", "activityCompleted"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;

      const today = new Date().toISOString().split("T")[0];

      // Get today's goals
      const goals = await db
        .select()
        .from(dailyGoals)
        .where(and(eq(dailyGoals.userId, ctx.user.id), eq(dailyGoals.date, today)))
        .limit(1);

      if (!goals[0]) {
        await db.insert(dailyGoals).values({
          userId: ctx.user.id,
          date: today,
          [input.goalType]: true,
        });
      } else {
        await db
          .update(dailyGoals)
          .set({ [input.goalType]: true })
          .where(and(eq(dailyGoals.userId, ctx.user.id), eq(dailyGoals.date, today)));
      }

      // Check if all goals are complete
      const updated = await db
        .select()
        .from(dailyGoals)
        .where(and(eq(dailyGoals.userId, ctx.user.id), eq(dailyGoals.date, today)))
        .limit(1);

      if (updated[0] && updated[0].workoutCompleted && updated[0].mealsLogged && updated[0].activityCompleted) {
        // Award bonus XP
        await db
          .update(dailyGoals)
          .set({ allGoalsCompletedAt: new Date() })
          .where(and(eq(dailyGoals.userId, ctx.user.id), eq(dailyGoals.date, today)));

        return { allGoalsCompleted: true };
      }

      return { allGoalsCompleted: false };
    }),

  // Get user achievements
  getAchievements: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    return await db.select().from(userAchievements).where(eq(userAchievements.userId, ctx.user.id));
  }),

  // Get login streak
  getLoginStreak: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(loginStreaks)
      .where(eq(loginStreaks.userId, ctx.user.id))
      .limit(1);

    return result[0] || null;
  }),

  // Update login streak
  updateLoginStreak: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const today = new Date().toISOString().split("T")[0];
    const result = await db
      .select()
      .from(loginStreaks)
      .where(eq(loginStreaks.userId, ctx.user.id))
      .limit(1);

    if (!result[0]) {
      await db.insert(loginStreaks).values({
        userId: ctx.user.id,
        currentStreak: 1,
        longestStreak: 1,
        lastLoginDate: today,
      });
      return { currentStreak: 1, longestStreak: 1 };
    }

    const streak = result[0];
    const lastDate = streak.lastLoginDate;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    let newStreak = streak.currentStreak;
    if (lastDate === today) {
      // Already logged in today
      return { currentStreak: newStreak, longestStreak: streak.longestStreak };
    } else if (lastDate === yesterday) {
      // Continue streak
      newStreak = streak.currentStreak + 1;
    } else {
      // Break streak
      newStreak = 1;
    }

    const newLongest = Math.max(newStreak, streak.longestStreak || 0);

    await db
      .update(loginStreaks)
      .set({
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastLoginDate: today,
      })
      .where(eq(loginStreaks.userId, ctx.user.id));

    return { currentStreak: newStreak, longestStreak: newLongest };
  }),

  // Toggle Beast Mode
  toggleBeastMode: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(beastMode)
      .where(eq(beastMode.userId, ctx.user.id))
      .limit(1);

    if (!result[0]) {
      await db.insert(beastMode).values({
        userId: ctx.user.id,
        isActive: true,
        activatedAt: new Date(),
        totalActivations: 1,
      });
      return { isActive: true };
    }

    const newActive = !result[0].isActive;
    await db
      .update(beastMode)
      .set({
        isActive: newActive,
        activatedAt: newActive ? new Date() : result[0].activatedAt,
        deactivatedAt: !newActive ? new Date() : result[0].deactivatedAt,
        totalActivations: newActive ? (result[0].totalActivations || 0) + 1 : result[0].totalActivations,
      })
      .where(eq(beastMode.userId, ctx.user.id));

    return { isActive: newActive };
  }),

  // Get Beast Mode status
  getBeastMode: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(beastMode)
      .where(eq(beastMode.userId, ctx.user.id))
      .limit(1);

    return result[0] || null;
  }),
});
