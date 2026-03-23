import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { workoutSessions, workoutExerciseLogs, workoutSets } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const workoutsRouter = router({
  createSession: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [result] = await db.insert(workoutSessions).values({
        userId: ctx.user.id,
        title: input.name,
        notes: input.description,
        type: "strength",
      });

      return { success: true, sessionId: result.insertId };
    }),

  getActiveSession: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const sessions = await db
        .select()
        .from(workoutSessions)
        .where(eq(workoutSessions.userId, ctx.user.id))
        .limit(1);

      return sessions[0] || null;
    }),

  getHistory: protectedProcedure
    .input(z.object({
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(workoutSessions)
        .where(eq(workoutSessions.userId, ctx.user.id))
        .orderBy(desc(workoutSessions.completedAt))
        .limit(input.limit)
        .offset(input.offset);
    }),

  addExercise: protectedProcedure
    .input(z.object({
      workoutSessionId: z.number(),
      exerciseId: z.number(),
      superset: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const logs = await db
        .select()
        .from(workoutExerciseLogs)
        .where(eq(workoutExerciseLogs.workoutSessionId, input.workoutSessionId));

      const order = logs.length + 1;

      const [logResult] = await db.insert(workoutExerciseLogs).values({
        workoutSessionId: input.workoutSessionId,
        exerciseId: input.exerciseId,
        order,
        superset: input.superset || null,
      });

      return { success: true, exerciseLogId: logResult.insertId };
    }),

  getExercises: protectedProcedure
    .input(z.object({
      workoutSessionId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(workoutExerciseLogs)
        .where(eq(workoutExerciseLogs.workoutSessionId, input.workoutSessionId));
    }),

  logSet: protectedProcedure
    .input(z.object({
      workoutExerciseLogId: z.number(),
      setNumber: z.number(),
      reps: z.number().optional(),
      weight: z.number().optional(),
      weightUnit: z.enum(["kg", "lbs"]).default("kg"),
      duration: z.number().optional(),
      distance: z.number().optional(),
      distanceUnit: z.enum(["km", "miles"]).default("km"),
      rpe: z.number().min(1).max(10).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [setResult] = await db.insert(workoutSets).values({
        workoutExerciseLogId: input.workoutExerciseLogId,
        setNumber: input.setNumber,
        reps: input.reps || null,
        weight: input.weight || null,
        weightUnit: input.weightUnit,
        duration: input.duration || null,
        distance: input.distance || null,
        distanceUnit: input.distanceUnit,
        rpe: input.rpe || null,
        notes: input.notes || null,
        completedAt: new Date(),
      });

      return { success: true, setId: setResult.insertId };
    }),

  getSets: protectedProcedure
    .input(z.object({
      workoutExerciseLogId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(workoutSets)
        .where(eq(workoutSets.workoutExerciseLogId, input.workoutExerciseLogId));
    }),

  updateSet: protectedProcedure
    .input(z.object({
      setId: z.number(),
      reps: z.number().optional(),
      weight: z.number().optional(),
      weightUnit: z.enum(["kg", "lbs"]).optional(),
      duration: z.number().optional(),
      distance: z.number().optional(),
      distanceUnit: z.enum(["km", "miles"]).optional(),
      rpe: z.number().min(1).max(10).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updates: any = {};
      if (input.reps !== undefined) updates.reps = input.reps;
      if (input.weight !== undefined) updates.weight = input.weight;
      if (input.weightUnit) updates.weightUnit = input.weightUnit;
      if (input.duration !== undefined) updates.duration = input.duration;
      if (input.distance !== undefined) updates.distance = input.distance;
      if (input.distanceUnit) updates.distanceUnit = input.distanceUnit;
      if (input.rpe !== undefined) updates.rpe = input.rpe;
      if (input.notes !== undefined) updates.notes = input.notes;

      await db
        .update(workoutSets)
        .set(updates)
        .where(eq(workoutSets.id, input.setId));

      return { success: true };
    }),

  deleteSet: protectedProcedure
    .input(z.object({
      setId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(workoutSets).where(eq(workoutSets.id, input.setId));
      return { success: true };
    }),

  completeSession: protectedProcedure
    .input(z.object({
      workoutSessionId: z.number(),
      durationMinutes: z.number(),
      caloriesBurned: z.number().optional(),
      rating: z.number().min(1).max(5).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(workoutSessions)
        .set({
          durationMinutes: input.durationMinutes,
          caloriesBurned: input.caloriesBurned || null,
          rating: input.rating || null,
          completedAt: new Date(),
        })
        .where(eq(workoutSessions.id, input.workoutSessionId));

      return { success: true };
    }),

  removeExercise: protectedProcedure
    .input(z.object({
      workoutExerciseLogId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(workoutSets)
        .where(eq(workoutSets.workoutExerciseLogId, input.workoutExerciseLogId));

      await db
        .delete(workoutExerciseLogs)
        .where(eq(workoutExerciseLogs.id, input.workoutExerciseLogId));

      return { success: true };
    }),

  getPerformanceStats: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;

      // Get all completed sessions
      const sessions = await db
        .select()
        .from(workoutSessions)
        .where(eq(workoutSessions.userId, ctx.user.id));

      const completedSessions = sessions.filter(s => s.completedAt !== null);

      // Get all exercise logs for this user's sessions
      const sessionIds = completedSessions.map(s => s.id);

      let allSets: typeof workoutSets.$inferSelect[] = [];
      let allExerciseLogs: typeof workoutExerciseLogs.$inferSelect[] = [];

      if (sessionIds.length > 0) {
        // Fetch exercise logs for all sessions
        for (const sessionId of sessionIds) {
          const logs = await db
            .select()
            .from(workoutExerciseLogs)
            .where(eq(workoutExerciseLogs.workoutSessionId, sessionId));
          allExerciseLogs.push(...logs);
        }

        // Fetch all sets
        for (const log of allExerciseLogs) {
          const sets = await db
            .select()
            .from(workoutSets)
            .where(eq(workoutSets.workoutExerciseLogId, log.id));
          allSets.push(...sets);
        }
      }

      // Calculate total volume (weight * reps)
      const totalVolumeKg = allSets.reduce((sum, s) => {
        if (!s.weight || !s.reps) return sum;
        const w = s.weightUnit === 'lbs' ? s.weight * 0.453592 : s.weight;
        return sum + w * s.reps;
      }, 0);

      // Calculate total time
      const totalMinutes = completedSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

      // Calculate total reps
      const totalReps = allSets.reduce((sum, s) => sum + (s.reps || 0), 0);

      // Build weekly stats (last 8 weeks)
      const now = new Date();
      const weeklyStats = Array.from({ length: 8 }, (_, i) => {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (7 * (7 - i)));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        const weekSessions = completedSessions.filter(s => {
          if (!s.completedAt) return false;
          const d = new Date(s.completedAt);
          return d >= weekStart && d < weekEnd;
        });

        const weekVolume = weekSessions.reduce((sum, session) => {
          const sessionLogs = allExerciseLogs.filter(l => l.workoutSessionId === session.id);
          const sessionSets = allSets.filter(s => sessionLogs.some(l => l.id === s.workoutExerciseLogId));
          return sum + sessionSets.reduce((sv, s) => {
            if (!s.weight || !s.reps) return sv;
            const w = s.weightUnit === 'lbs' ? s.weight * 0.453592 : s.weight;
            return sv + w * s.reps;
          }, 0);
        }, 0);

        return {
          week: `W${i + 1}`,
          workouts: weekSessions.length,
          volume: Math.round(weekVolume),
          minutes: weekSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0),
        };
      });

      return {
        totalWorkouts: completedSessions.length,
        totalVolumeKg: Math.round(totalVolumeKg),
        totalMinutes,
        totalSets: allSets.length,
        totalReps,
        weeklyStats,
        recentSessions: completedSessions
          .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
          .slice(0, 5)
          .map(s => ({
            id: s.id,
            title: s.title,
            durationMinutes: s.durationMinutes,
            completedAt: s.completedAt,
            rating: s.rating,
          })),
      };
    }),
});
