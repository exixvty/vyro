import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { friendsRouter } from "./routers/friends";
import { exercisesRouter } from "./routers/exercises";
import { workoutsRouter } from "./routers/workouts";
import { engagementRouter } from "./routers/engagement";
import { themeRouter } from "./routers/theme";
import { notificationsRouter } from "./routers/notifications";
import { recoveryRouter } from "./routers/recovery";

import {
  userProfiles,
  workoutPlans,
  workoutSessions,
  nutritionLogs,
  nutritionGoals,
  progressEntries,
  personalRecords,
  habits,
  habitCompletions,
  userGameStats,
  achievements,
  activityFeed,
  follows,
  feedLikes,
  users,
  friendships,
  referralCodes,
  themePreferences,
} from "../drizzle/schema";
import { eq, and, desc, sql, inArray, or, ne } from "drizzle-orm";

// ─── Profile Router ───────────────────────────────────────────────────────────
const profileRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, ctx.user.id))
      .limit(1);
    return result[0] ?? null;
  }),

  upsert: protectedProcedure
    .input(
      z.object({
        avatarUrl: z.string().optional(),
        bio: z.string().optional(),
        age: z.number().optional(),
        heightCm: z.number().optional(),
        weightKg: z.number().optional(),
        fitnessLevel: z.enum(["beginner", "intermediate", "advanced", "athlete"]).optional(),
        primaryGoal: z.enum(["fat_loss", "lean_bulk", "muscle_gain", "athlete_performance", "general_fitness"]).optional(),
        athleteType: z.enum(["bodybuilder", "footballer", "runner", "swimmer", "basketball", "general"]).optional(),
        unitSystem: z.enum(["metric", "imperial"]).optional(),
        themeMode: z.enum(["dark", "light", "system"]).optional(),
        accentColor: z.string().optional(),
        onboardingCompleted: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db
        .insert(userProfiles)
        .values({ userId: ctx.user.id, ...input })
        .onDuplicateKeyUpdate({ set: input });
      return { success: true };
    }),
});

// ─── Workout Router ───────────────────────────────────────────────────────────
const workoutRouter = router({
  generatePlan: protectedProcedure
    .input(
      z.object({
        goal: z.string(),
        fitnessLevel: z.string(),
        athleteType: z.string(),
        daysPerWeek: z.number().min(1).max(7),
        durationWeeks: z.number().min(1).max(16),
        equipment: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const prompt = `You are an expert personal trainer. Create a detailed ${input.durationWeeks}-week workout plan.
User profile:
- Goal: ${input.goal}
- Fitness level: ${input.fitnessLevel}
- Athlete type: ${input.athleteType}
- Days per week: ${input.daysPerWeek}
- Equipment: ${input.equipment || "full gym"}

Return a JSON object with this exact structure:
{
  "title": "Plan name",
  "description": "Brief description",
  "difficulty": "beginner|intermediate|advanced",
  "weeks": [
    {
      "weekNumber": 1,
      "days": [
        {
          "dayNumber": 1,
          "name": "Day name",
          "focus": "muscle group",
          "exercises": [
            {
              "name": "Exercise name",
              "sets": 3,
              "reps": "8-12",
              "rest": "60s",
              "notes": "form tip"
            }
          ]
        }
      ]
    }
  ]
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert fitness coach. Always respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" } as any,
      });

      const rawContent = response.choices[0]?.message?.content;
      const content = typeof rawContent === 'string' ? rawContent : '{}';
      let planData: any = {};
      try {
        planData = JSON.parse(content);
      } catch {
        planData = { title: "Custom Plan", description: "AI-generated plan", weeks: [] };
      }

      const [inserted] = await db.insert(workoutPlans).values({
        userId: ctx.user.id,
        title: planData.title || "AI Workout Plan",
        description: planData.description || "",
        type: "ai_generated",
        difficulty: input.fitnessLevel as any,
        durationWeeks: input.durationWeeks,
        daysPerWeek: input.daysPerWeek,
        exercises: planData.weeks || [],
      });

      // Award XP
      await awardXP(db, ctx.user.id, 50, "Generated AI workout plan");

      return { planId: (inserted as any).insertId, plan: planData };
    }),

  getPlans: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(workoutPlans)
      .where(and(eq(workoutPlans.userId, ctx.user.id), eq(workoutPlans.isActive, true)))
      .orderBy(desc(workoutPlans.createdAt));
  }),

  logSession: protectedProcedure
    .input(
      z.object({
        planId: z.number().optional(),
        title: z.string(),
        type: z.enum(["strength", "cardio", "hiit", "flexibility", "sport"]),
        durationMinutes: z.number(),
        caloriesBurned: z.number().optional(),
        exercises: z.any(),
        notes: z.string().optional(),
        rating: z.number().min(1).max(5).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      await db.insert(workoutSessions).values({
        userId: ctx.user.id,
        ...input,
      });

      // Update game stats
      const xpEarned = Math.floor(input.durationMinutes * 2);
      await awardXP(db, ctx.user.id, xpEarned, "Completed workout");

      // Update stats
      await db
        .insert(userGameStats)
        .values({
          userId: ctx.user.id,
          totalWorkouts: 1,
          totalMinutes: input.durationMinutes,
          workoutStreak: 1,
        })
        .onDuplicateKeyUpdate({
          set: {
            totalWorkouts: sql`totalWorkouts + 1`,
            totalMinutes: sql`totalMinutes + ${input.durationMinutes}`,
          },
        });

      // Add to activity feed
      await db.insert(activityFeed).values({
        userId: ctx.user.id,
        type: "workout_completed",
        title: `Completed "${input.title}"`,
        description: `${input.durationMinutes} minutes · ${input.caloriesBurned || 0} calories burned`,
        metadata: { type: input.type, duration: input.durationMinutes },
      });

      return { success: true, xpEarned };
    }),

  getSessions: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(workoutSessions)
        .where(eq(workoutSessions.userId, ctx.user.id))
        .orderBy(desc(workoutSessions.completedAt))
        .limit(input.limit);
    }),

  quickWorkout: protectedProcedure
    .input(z.object({
      timeMinutes: z.number(),
      energyLevel: z.enum(["low", "medium", "high"]),
      focus: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const prompt = `Generate a quick ${input.timeMinutes}-minute workout for someone with ${input.energyLevel} energy.
Focus: ${input.focus || "full body"}
Return JSON: { "title": "...", "exercises": [{ "name": "...", "duration": "30s", "reps": "10", "rest": "15s" }] }`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a fitness coach. Return valid JSON only." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" } as any,
      });

      const rawContent2 = response.choices[0]?.message?.content;
      const content2 = typeof rawContent2 === 'string' ? rawContent2 : '{}';
      try {
        return JSON.parse(content2);
      } catch {
        return { title: "Quick Workout", exercises: [] };
      }
    }),
});

// ─── Nutrition Router ─────────────────────────────────────────────────────────
const nutritionRouter = router({
  logFood: protectedProcedure
    .input(
      z.object({
        logDate: z.string(),
        mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
        foodName: z.string(),
        calories: z.number(),
        proteinG: z.number().optional(),
        carbsG: z.number().optional(),
        fatG: z.number().optional(),
        servingSize: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.insert(nutritionLogs).values({ userId: ctx.user.id, ...input });
      const xpResult = await awardXPWithLevelUp(db, ctx.user.id, 20, "Logged food");
      return { success: true, ...xpResult };
    }),
  getDayLogs: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(nutritionLogs)
        .where(
          and(
            eq(nutritionLogs.userId, ctx.user.id),
            eq(nutritionLogs.logDate, input.date)
          )
        )
        .orderBy(nutritionLogs.mealType);
    }),

  deleteLog: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db
        .delete(nutritionLogs)
        .where(
          and(eq(nutritionLogs.id, input.id), eq(nutritionLogs.userId, ctx.user.id))
        );
      return { success: true };
    }),

  getGoals: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db
      .select()
      .from(nutritionGoals)
      .where(eq(nutritionGoals.userId, ctx.user.id))
      .limit(1);
    return result[0] ?? { dailyCalories: 2000, proteinG: 150, carbsG: 200, fatG: 65 };
  }),

  setGoals: protectedProcedure
    .input(
      z.object({
        dailyCalories: z.number(),
        proteinG: z.number(),
        carbsG: z.number(),
        fatG: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db
        .insert(nutritionGoals)
        .values({ userId: ctx.user.id, ...input })
        .onDuplicateKeyUpdate({ set: input });
      return { success: true };
    }),

  suggestMeal: protectedProcedure
    .input(z.object({
      goal: z.string(),
      mealType: z.string(),
      calories: z.number(),
      preferences: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const prompt = `Suggest a ${input.mealType} meal for someone with goal: ${input.goal}.
Target calories: ${input.calories}. Preferences: ${input.preferences || "none"}.
Return JSON: { "meals": [{ "name": "...", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "description": "..." }] }`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a nutrition expert. Return valid JSON only." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" } as any,
      });

      const rawContent3 = response.choices[0]?.message?.content;
      const content3 = typeof rawContent3 === 'string' ? rawContent3 : '{}';
      try {
        return JSON.parse(content3);
      } catch {
        return { meals: [] };
      }
    }),
});

// ─── Progress Router ──────────────────────────────────────────────────────────
const progressRouter = router({
  logEntry: protectedProcedure
    .input(
      z.object({
        entryDate: z.string(),
        weightKg: z.number().optional(),
        bodyFatPct: z.number().optional(),
        chestCm: z.number().optional(),
        waistCm: z.number().optional(),
        hipsCm: z.number().optional(),
        armCm: z.number().optional(),
        thighCm: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.insert(progressEntries).values({ userId: ctx.user.id, ...input });
      await awardXP(db, ctx.user.id, 20, "Logged progress");
      return { success: true };
    }),

  getEntries: protectedProcedure
    .input(z.object({ limit: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(progressEntries)
        .where(eq(progressEntries.userId, ctx.user.id))
        .orderBy(desc(progressEntries.entryDate))
        .limit(input.limit);
    }),

  getRecords: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(personalRecords)
      .where(eq(personalRecords.userId, ctx.user.id))
      .orderBy(desc(personalRecords.createdAt));
  }),

  setRecord: protectedProcedure
    .input(
      z.object({
        exerciseName: z.string(),
        value: z.number(),
        unit: z.string(),
        recordDate: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.insert(personalRecords).values({ userId: ctx.user.id, ...input });

      await db.insert(activityFeed).values({
        userId: ctx.user.id,
        type: "pr_set",
        title: `New PR: ${input.exerciseName}`,
        description: `${input.value}${input.unit}`,
        metadata: input,
      });

      await awardXP(db, ctx.user.id, 100, "Set personal record");
      return { success: true };
    }),
});

// ─── Habits Router ────────────────────────────────────────────────────────────
const habitsRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        icon: z.string().default("check"),
        color: z.string().default("violet"),
        targetDays: z.array(z.number()).optional(),
        reminderTime: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.insert(habits).values({
        userId: ctx.user.id,
        ...input,
        targetDays: input.targetDays || [0, 1, 2, 3, 4, 5, 6],
      });
      return { success: true };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, ctx.user.id), eq(habits.isActive, true)))
      .orderBy(desc(habits.currentStreak));
  }),

  complete: protectedProcedure
    .input(z.object({ habitId: z.number(), date: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      // Check if already completed
      const existing = await db
        .select()
        .from(habitCompletions)
        .where(
          and(
            eq(habitCompletions.habitId, input.habitId),
            eq(habitCompletions.userId, ctx.user.id),
            eq(habitCompletions.completedDate, input.date)
          )
        )
        .limit(1);

      if (existing.length > 0) return { success: true, alreadyDone: true, leveledUp: false, xpEarned: 0, oldLevel: 1, newLevel: 1, tierChanged: false, oldTier: "Rookie", newTier: "Rookie" };

      await db.insert(habitCompletions).values({
        habitId: input.habitId,
        userId: ctx.user.id,
        completedDate: input.date,
      });

      // Update streak
      await db
        .update(habits)
        .set({ currentStreak: sql`currentStreak + 1` })
        .where(eq(habits.id, input.habitId));

      const xpResult = await awardXPWithLevelUp(db, ctx.user.id, 30, "Completed habit");
      return { success: true, ...xpResult };
    }),

  getCompletions: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(habitCompletions)
        .where(
          and(
            eq(habitCompletions.userId, ctx.user.id),
            eq(habitCompletions.completedDate, input.date)
          )
        );
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db
        .update(habits)
        .set({ isActive: false })
        .where(and(eq(habits.id, input.id), eq(habits.userId, ctx.user.id)));
      return { success: true };
    }),
});

// ─── Gamification Router ──────────────────────────────────────────────────────
const gamificationRouter = router({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db
      .select()
      .from(userGameStats)
      .where(eq(userGameStats.userId, ctx.user.id))
      .limit(1);
    return result[0] ?? { xp: 0, level: 1, totalWorkouts: 0, totalMinutes: 0, workoutStreak: 0, longestStreak: 0 };
  }),

  getAchievements: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, ctx.user.id))
      .orderBy(desc(achievements.earnedAt));
  }),

  getLeaderboard: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select({
        userId: userGameStats.userId,
        xp: userGameStats.xp,
        level: userGameStats.level,
        totalWorkouts: userGameStats.totalWorkouts,
        name: users.name,
      })
      .from(userGameStats)
      .leftJoin(users, eq(userGameStats.userId, users.id))
      .orderBy(desc(userGameStats.xp))
      .limit(20);
  }),
});

// ─── Social Router ────────────────────────────────────────────────────────────
const socialRouter = router({
  getFeed: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select({
          id: activityFeed.id,
          type: activityFeed.type,
          title: activityFeed.title,
          description: activityFeed.description,
          metadata: activityFeed.metadata,
          likesCount: activityFeed.likesCount,
          createdAt: activityFeed.createdAt,
          userId: activityFeed.userId,
          userName: users.name,
        })
        .from(activityFeed)
        .leftJoin(users, eq(activityFeed.userId, users.id))
        .where(eq(activityFeed.isPublic, true))
        .orderBy(desc(activityFeed.createdAt))
        .limit(input.limit);
    }),

  likeItem: protectedProcedure
    .input(z.object({ feedItemId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const existing = await db
        .select()
        .from(feedLikes)
        .where(
          and(
            eq(feedLikes.feedItemId, input.feedItemId),
            eq(feedLikes.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        await db
          .delete(feedLikes)
          .where(
            and(
              eq(feedLikes.feedItemId, input.feedItemId),
              eq(feedLikes.userId, ctx.user.id)
            )
          );
        await db
          .update(activityFeed)
          .set({ likesCount: sql`GREATEST(likesCount - 1, 0)` })
          .where(eq(activityFeed.id, input.feedItemId));
        return { liked: false };
      }

      await db.insert(feedLikes).values({ feedItemId: input.feedItemId, userId: ctx.user.id });
      await db
        .update(activityFeed)
        .set({ likesCount: sql`likesCount + 1` })
        .where(eq(activityFeed.id, input.feedItemId));
      return { liked: true };
    }),

  getMyLikes: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const result = await db
      .select({ feedItemId: feedLikes.feedItemId })
      .from(feedLikes)
      .where(eq(feedLikes.userId, ctx.user.id));
    return result.map((r) => r.feedItemId);
  }),
});

// ─── Helper: Award XP ─────────────────────────────────────────────────────────
async function awardXP(db: any, userId: number, xp: number, _reason: string) {
  await db
    .insert(userGameStats)
    .values({ userId, xp, level: 1 })
    .onDuplicateKeyUpdate({
      set: {
        xp: sql`xp + ${xp}`,
        level: sql`GREATEST(1, FLOOR(1 + SQRT(xp / 100)))`,
      },
    });
}

const TIER_THRESHOLDS = [
  { tier: "Rookie", minLevel: 1 },
  { tier: "Athlete", minLevel: 5 },
  { tier: "Warrior", minLevel: 10 },
  { tier: "Champion", minLevel: 20 },
  { tier: "Elite", minLevel: 35 },
  { tier: "Legend", minLevel: 50 },
];
function getTierForLevel(level: number): string {
  let tier = "Rookie";
  for (const t of TIER_THRESHOLDS) {
    if (level >= t.minLevel) tier = t.tier;
    else break;
  }
  return tier;
}

async function awardXPWithLevelUp(db: any, userId: number, xp: number, reason: string) {
  // Get current stats before update
  const before = await db.select().from(userGameStats).where(eq(userGameStats.userId, userId)).limit(1);
  const oldLevel = before[0]?.level ?? 1;
  const oldTier = getTierForLevel(oldLevel);

  await awardXP(db, userId, xp, reason);

  // Get updated stats
  const after = await db.select().from(userGameStats).where(eq(userGameStats.userId, userId)).limit(1);
  const newLevel = after[0]?.level ?? 1;
  const newTier = getTierForLevel(newLevel);

  return {
    xpEarned: xp,
    leveledUp: newLevel > oldLevel,
    oldLevel,
    newLevel,
    tierChanged: newTier !== oldTier,
    oldTier,
    newTier,
  };
}

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  profile: profileRouter,
  workout: workoutRouter,
  nutrition: nutritionRouter,
  progress: progressRouter,
  habits: habitsRouter,
  gamification: gamificationRouter,
  social: socialRouter,
  friends: friendsRouter,
  exercises: exercisesRouter,
  workouts: workoutsRouter,
  engagement: engagementRouter,
  theme: themeRouter,
  notifications: notificationsRouter,
  recovery: recoveryRouter,
});

export type AppRouter = typeof appRouter;
