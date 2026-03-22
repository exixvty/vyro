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

      await db.insert(workoutSessions).values({
        userId: ctx.user.id,
        title: input.name,
        notes: input.description,
        type: "strength",
      });

      return { success: true };
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

      await db.insert(workoutExerciseLogs).values({
        workoutSessionId: input.workoutSessionId,
        exerciseId: input.exerciseId,
        order,
        superset: input.superset || null,
      });

      return { success: true };
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

      await db.insert(workoutSets).values({
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

      return { success: true };
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
});
