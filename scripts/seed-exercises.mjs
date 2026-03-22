import { getDb } from "../server/db.ts";
import { exercises } from "../drizzle/schema.ts";
import { EXERCISES } from "../server/exercises.ts";

async function seedExercises() {
  const db = await getDb();
  if (!db) {
    console.error("Database connection failed");
    process.exit(1);
  }

  try {
    console.log(`Seeding ${EXERCISES.length} exercises...`);

    // Insert exercises in batches
    const batchSize = 50;
    for (let i = 0; i < EXERCISES.length; i += batchSize) {
      const batch = EXERCISES.slice(i, i + batchSize);
      const values = batch.map((ex) => ({
        name: ex.name,
        category: ex.category,
        type: ex.type,
        difficulty: ex.difficulty,
        equipment: JSON.stringify(ex.equipment),
        description: ex.description,
        muscleGroups: JSON.stringify(ex.muscleGroups),
      }));

      await db.insert(exercises).values(values).onDuplicateKeyUpdate({
        set: {
          description: db.raw("VALUES(description)"),
        },
      });

      console.log(`✓ Seeded exercises ${i + 1}-${Math.min(i + batchSize, EXERCISES.length)}`);
    }

    console.log("✅ Exercise seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedExercises();
