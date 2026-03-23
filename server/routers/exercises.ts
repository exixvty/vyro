import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { exercises } from "../../drizzle/schema";
import { eq, like, inArray } from "drizzle-orm";
import z from "zod";

export const exercisesRouter = router({
  // Get all exercises
  getAll: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(exercises);
  }),

  // Search exercises by name
  search: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(exercises)
        .where(like(exercises.name, `%${input.query}%`))
        .limit(20);
    }),

  // Get exercises by category
  byCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(exercises).where(eq(exercises.category, input.category as any));
    }),

  // Get exercises by muscle group
  byMuscleGroup: publicProcedure
    .input(z.object({ muscleGroup: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const all = await db.select().from(exercises);
      return all.filter((ex) => {
        const groups = Array.isArray(ex.muscleGroups) ? ex.muscleGroups : JSON.parse(String(ex.muscleGroups));
        return groups.includes(input.muscleGroup);
      });
    }),

  // Get exercises by type (compound, isolation, cardio, functional)
  byType: publicProcedure
    .input(z.object({ type: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(exercises).where(eq(exercises.type, input.type as any));
    }),

  // Get exercises by difficulty
  byDifficulty: publicProcedure
    .input(z.object({ difficulty: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(exercises).where(eq(exercises.difficulty, input.difficulty as any));
    }),

  // Get exercises by equipment
  byEquipment: publicProcedure
    .input(z.object({ equipment: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const all = await db.select().from(exercises);
      return all.filter((ex) => {
        const equip = Array.isArray(ex.equipment) ? ex.equipment : JSON.parse(String(ex.equipment));
        return equip.includes(input.equipment);
      });
    }),

  // Get single exercise
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(exercises).where(eq(exercises.id, input.id)).limit(1);
      return result[0] ?? null;
    }),

  // Get exercises with multiple filters
  filter: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        type: z.string().optional(),
        difficulty: z.string().optional(),
        muscleGroup: z.string().optional(),
        equipment: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let results = await db.select().from(exercises);

      if (input.category) {
        results = results.filter((ex) => ex.category === input.category);
      }
      if (input.type) {
        results = results.filter((ex) => ex.type === input.type);
      }
      if (input.difficulty) {
        results = results.filter((ex) => ex.difficulty === input.difficulty);
      }

      if (input.muscleGroup) {
        results = results.filter((ex) => {
          const groups = Array.isArray(ex.muscleGroups) ? ex.muscleGroups : JSON.parse(String(ex.muscleGroups));
          return groups.includes(input.muscleGroup);
        });
      }

      if (input.equipment) {
        results = results.filter((ex) => {
          const equip = Array.isArray(ex.equipment) ? ex.equipment : JSON.parse(String(ex.equipment));
          return equip.includes(input.equipment);
        });
      }

      return results;
    }),

  // Get categories
  getCategories: publicProcedure.query(async () => {
    return ["chest", "back", "shoulders", "biceps", "triceps", "forearms", "legs", "glutes", "core", "cardio", "functional"];
  }),

  // Get muscle groups
  getMuscleGroups: publicProcedure.query(async () => {
    return [
      "chest",
      "back",
      "shoulders",
      "biceps",
      "triceps",
      "forearms",
      "quads",
      "hamstrings",
      "glutes",
      "calves",
      "core",
      "abs",
      "obliques",
      "lats",
      "traps",
      "rear delts",
      "front delts",
      "lateral delts",
      "upper chest",
      "lower chest",
      "upper back",
      "grip",
    ];
  }),

  // Get equipment types
  getEquipment: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const all = await db.select().from(exercises);
    const equipmentSet = new Set<string>();
    all.forEach((ex) => {
      const equip = Array.isArray(ex.equipment) ? ex.equipment : JSON.parse(String(ex.equipment));
      equip.forEach((e: string) => equipmentSet.add(e));
    });
    return Array.from(equipmentSet).sort();
  }),
});
