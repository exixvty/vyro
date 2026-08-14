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
import { calculatePremiumAccess, getPremiumAccess, getTrialEndDate } from "./premiumAccess";
import { storagePut } from "./storage";
import { TRPCError } from "@trpc/server";

import {
  userProfiles,
  workoutPlans,
  workoutSessions,
  nutritionLogs,
  nutritionGoals,
  progressEntries,
  personalRecords,
  progressPhotos,
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
import { eq, and, desc, sql, inArray, or, ne, gte } from "drizzle-orm";

async function getAcceptedFriendIds(db: any, userId: number) {
  const connections = await db
    .select({ userId: friendships.userId, friendId: friendships.friendId })
    .from(friendships)
    .where(and(
      eq(friendships.status, "accepted"),
      or(eq(friendships.userId, userId), eq(friendships.friendId, userId))
    ));

  return connections.map((connection: { userId: number; friendId: number }) =>
    connection.userId === userId ? connection.friendId : connection.userId
  );
}

function canViewActivity(
  item: { userId: number; audience: "public" | "friends" | "private" },
  viewerId: number,
  friendIds: number[]
) {
  return item.userId === viewerId
    || item.audience === "public"
    || (item.audience === "friends" && friendIds.includes(item.userId));
}

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

  getPremiumStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    return getPremiumAccess(db, ctx.user.id);
  }),

  startTrial: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");

    const existing = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, ctx.user.id))
      .limit(1);
    const currentProfile = existing[0] ?? null;

    // The timestamp is intentionally immutable: a second click returns the
    // current status rather than silently extending or restarting a trial.
    if (currentProfile?.trialStartedAt) {
      return { ...calculatePremiumAccess(currentProfile), started: false };
    }

    const trialStartedAt = new Date();
    const trialExpiresAt = getTrialEndDate(trialStartedAt);
    if (currentProfile) {
      await db
        .update(userProfiles)
        .set({ trialStartedAt, trialExpiresAt })
        .where(eq(userProfiles.userId, ctx.user.id));
    } else {
      await db.insert(userProfiles).values({
        userId: ctx.user.id,
        trialStartedAt,
        trialExpiresAt,
      });
    }

    return {
      ...calculatePremiumAccess({
        isPremium: false,
        premiumExpiresAt: null,
        trialStartedAt,
        trialExpiresAt,
      }),
      started: true,
    };
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

  uploadAvatar: protectedProcedure
    .input(z.object({
      imageBase64: z.string().min(1).max(7_000_000),
      mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const imageBytes = Buffer.from(input.imageBase64, "base64");
      if (imageBytes.length === 0 || imageBytes.length > 5 * 1024 * 1024) {
        throw new Error("Profile pictures must be an image up to 5 MB");
      }

      const extension = input.mimeType === "image/png" ? "png" : input.mimeType === "image/webp" ? "webp" : "jpg";
      const { url } = await storagePut(
        `avatars/${ctx.user.id}/avatar-${Date.now()}.${extension}`,
        imageBytes,
        input.mimeType
      );

      await db
        .insert(userProfiles)
        .values({ userId: ctx.user.id, avatarUrl: url })
        .onDuplicateKeyUpdate({ set: { avatarUrl: url } });

      return { avatarUrl: url };
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

      const xpEarned = Math.floor(input.durationMinutes * 2);

      // The completed session is the source of truth. Engagement side effects must
      // never trap an athlete in an active workout if an auxiliary write is delayed.
      const sideEffects = await Promise.allSettled([
        awardXPWithLevelUp(db, ctx.user.id, xpEarned, "Completed workout"),
        db
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
          }),
        db.insert(activityFeed).values({
          userId: ctx.user.id,
          type: "workout_completed",
          title: `Completed "${input.title}"`,
          description: `${input.durationMinutes} minutes · ${input.caloriesBurned || 0} calories burned`,
          metadata: { type: input.type, duration: input.durationMinutes },
        }),
      ]);

      const levelUp = sideEffects[0].status === "fulfilled" ? sideEffects[0].value : undefined;
      if (sideEffects.some((result) => result.status === "rejected")) {
        console.error("Workout completion side effect failed", sideEffects);
      }

      return { success: true, xpEarned, ...levelUp };
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

  /* ─── Photo procedures ─── */
  uploadPhoto: protectedProcedure
    .input(
      z.object({
        photoBase64: z.string().min(100),
        angle: z.enum(["front", "side", "back"]),
        notes: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const { storagePut } = await import("./storage");

      try {
        const buffer = Buffer.from(input.photoBase64, "base64");
        const timestamp = Date.now();
        const fileKey = `progress-photos/${ctx.user.id}/${input.angle}-${timestamp}.jpg`;
        const { url } = await storagePut(fileKey, buffer, "image/jpeg");

        const [result] = await db.insert(progressPhotos).values({
          userId: ctx.user.id,
          photoUrl: url,
          angle: input.angle,
          notes: input.notes || null,
          date: new Date(),
        });

        return {
          id: result.insertId,
          photoUrl: url,
          angle: input.angle,
          date: new Date(),
        };
      } catch (err) {
        console.error("Photo upload error:", err);
        throw new Error("Failed to upload photo");
      }
    }),

  listPhotos: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(progressPhotos)
      .where(eq(progressPhotos.userId, ctx.user.id))
      .orderBy(desc(progressPhotos.date));
  }),

  getPhotosByAngle: protectedProcedure
    .input(z.object({ angle: z.enum(["front", "side", "back"]) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(progressPhotos)
        .where(and(eq(progressPhotos.userId, ctx.user.id), eq(progressPhotos.angle, input.angle)))
        .orderBy(desc(progressPhotos.date));
    }),

  deletePhoto: protectedProcedure
    .input(z.object({ photoId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const photo = await db
        .select()
        .from(progressPhotos)
        .where(eq(progressPhotos.id, input.photoId))
        .limit(1);

      if (!photo[0] || photo[0].userId !== ctx.user.id) {
        throw new Error("Not your photo");
      }

      await db.delete(progressPhotos).where(eq(progressPhotos.id, input.photoId));
      return { success: true };
    }),

  getComparisonPair: protectedProcedure
    .input(z.object({ angle: z.enum(["front", "side", "back"]) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;

      const photos = await db
        .select()
        .from(progressPhotos)
        .where(and(eq(progressPhotos.userId, ctx.user.id), eq(progressPhotos.angle, input.angle)))
        .orderBy(progressPhotos.date);

      if (photos.length < 2) return null;

      const oldest = photos[0];
      const newest = photos[photos.length - 1];
      const daysDiff = Math.floor(
        (newest.date.getTime() - oldest.date.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        before: {
          id: oldest.id,
          photoUrl: oldest.photoUrl,
          date: oldest.date,
          notes: oldest.notes,
        },
        after: {
          id: newest.id,
          photoUrl: newest.photoUrl,
          date: newest.date,
          notes: newest.notes,
        },
        daysDiff,
      };
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
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const friendIds = await getAcceptedFriendIds(db, ctx.user.id);
      const visibleFriends = friendIds.length > 0 ? friendIds : [-1];

      return db
        .select({
          id: activityFeed.id,
          type: activityFeed.type,
          title: activityFeed.title,
          description: activityFeed.description,
          metadata: activityFeed.metadata,
          privateNotes: sql<string | null>`CASE WHEN ${activityFeed.userId} = ${ctx.user.id} THEN ${activityFeed.privateNotes} ELSE NULL END`,
          audience: activityFeed.audience,
          likesCount: activityFeed.likesCount,
          createdAt: activityFeed.createdAt,
          userId: activityFeed.userId,
          userName: users.name,
          avatarUrl: userProfiles.avatarUrl,
        })
        .from(activityFeed)
        .leftJoin(users, eq(activityFeed.userId, users.id))
        .leftJoin(userProfiles, eq(activityFeed.userId, userProfiles.userId))
        .where(or(
          eq(activityFeed.userId, ctx.user.id),
          eq(activityFeed.audience, "public"),
          and(eq(activityFeed.audience, "friends"), inArray(activityFeed.userId, visibleFriends))
        ))
        .orderBy(desc(activityFeed.createdAt))
        .limit(input.limit);
    }),

  getShareOptions: protectedProcedure
    .input(z.object({ sessionId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const sessions = await db
        .select({ id: workoutSessions.id, completedAt: workoutSessions.completedAt })
        .from(workoutSessions)
        .where(and(eq(workoutSessions.id, input.sessionId), eq(workoutSessions.userId, ctx.user.id)))
        .limit(1);
      const session = sessions[0];
      if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "Workout session not found" });

      const sessionDay = session.completedAt.toISOString().slice(0, 10);
      const [eligibleAchievements, eligiblePersonalRecords] = await Promise.all([
        db.select().from(achievements).where(and(eq(achievements.userId, ctx.user.id), gte(achievements.earnedAt, session.completedAt))),
        db.select().from(personalRecords).where(and(eq(personalRecords.userId, ctx.user.id), gte(personalRecords.recordDate, sessionDay))),
      ]);

      return { achievements: eligibleAchievements, personalRecords: eligiblePersonalRecords };
    }),

  createPost: protectedProcedure
    .input(z.object({
      sessionId: z.number().int().positive(),
      title: z.string().trim().min(1).max(300),
      publicReflection: z.string().trim().min(1).max(500),
      privateNotes: z.string().trim().max(2000).optional(),
      difficulty: z.enum(["easy", "moderate", "challenging", "max_effort"]),
      audience: z.enum(["public", "friends", "private"]),
      achievementIds: z.array(z.number().int().positive()).max(10).default([]),
      personalRecordIds: z.array(z.number().int().positive()).max(10).default([]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const sessions = await db
        .select()
        .from(workoutSessions)
        .where(and(eq(workoutSessions.id, input.sessionId), eq(workoutSessions.userId, ctx.user.id)))
        .limit(1);
      const session = sessions[0];
      if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "Workout session not found" });

      const sessionDay = session.completedAt.toISOString().slice(0, 10);
      const [selectedAchievements, selectedPersonalRecords] = await Promise.all([
        input.achievementIds.length > 0
          ? db.select().from(achievements).where(and(eq(achievements.userId, ctx.user.id), inArray(achievements.id, input.achievementIds), gte(achievements.earnedAt, session.completedAt)))
          : Promise.resolve([]),
        input.personalRecordIds.length > 0
          ? db.select().from(personalRecords).where(and(eq(personalRecords.userId, ctx.user.id), inArray(personalRecords.id, input.personalRecordIds), gte(personalRecords.recordDate, sessionDay)))
          : Promise.resolve([]),
      ]);
      if (selectedAchievements.length !== input.achievementIds.length || selectedPersonalRecords.length !== input.personalRecordIds.length) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only achievements and PRs eligible for this workout can be shared" });
      }

      const metadata = {
        workoutSessionId: session.id,
        workoutTitle: session.title,
        durationMinutes: session.durationMinutes,
        caloriesBurned: session.caloriesBurned,
        difficulty: input.difficulty,
        achievements: selectedAchievements.map((achievement) => ({ id: achievement.id, name: achievement.badgeName, icon: achievement.badgeIcon })),
        personalRecords: selectedPersonalRecords.map((record) => ({ id: record.id, exerciseName: record.exerciseName, value: record.value, unit: record.unit })),
      };
      const [result] = await db.insert(activityFeed).values({
        userId: ctx.user.id,
        type: "workout_completed",
        title: input.title,
        description: input.publicReflection,
        privateNotes: input.privateNotes || null,
        metadata,
        audience: input.audience,
        isPublic: input.audience === "public",
      });

      return { id: Number(result.insertId), audience: input.audience };
    }),

  likeItem: protectedProcedure
    .input(z.object({ feedItemId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const posts = await db
        .select({ userId: activityFeed.userId, audience: activityFeed.audience })
        .from(activityFeed)
        .where(eq(activityFeed.id, input.feedItemId))
        .limit(1);
      const post = posts[0];
      if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Community post not found" });
      const friendIds = await getAcceptedFriendIds(db, ctx.user.id);
      if (!canViewActivity(post, ctx.user.id, friendIds)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "This post is private" });
      }

      const existing = await db
        .select()
        .from(feedLikes)
        .where(and(eq(feedLikes.feedItemId, input.feedItemId), eq(feedLikes.userId, ctx.user.id)))
        .limit(1);
      if (existing.length > 0) {
        await db.delete(feedLikes).where(and(eq(feedLikes.feedItemId, input.feedItemId), eq(feedLikes.userId, ctx.user.id)));
        await db.update(activityFeed).set({ likesCount: sql`GREATEST(likesCount - 1, 0)` }).where(eq(activityFeed.id, input.feedItemId));
        return { liked: false };
      }

      await db.insert(feedLikes).values({ feedItemId: input.feedItemId, userId: ctx.user.id });
      await db.update(activityFeed).set({ likesCount: sql`likesCount + 1` }).where(eq(activityFeed.id, input.feedItemId));
      return { liked: true };
    }),

  getMyLikes: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const result = await db.select({ feedItemId: feedLikes.feedItemId }).from(feedLikes).where(eq(feedLikes.userId, ctx.user.id));
    return result.map((row) => row.feedItemId);
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
