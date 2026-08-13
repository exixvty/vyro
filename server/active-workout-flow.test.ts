import { describe, expect, it } from "vitest";
import {
  addActiveSet,
  appendActiveExercise,
  canFinishActiveWorkout,
  completedExercisePayload,
  cycleActiveSetType,
  elapsedSeconds,
  removeActiveExercise,
  removeActiveSet,
  resetActiveWorkout,
  replaceExerciseSets,
  toggleActiveSetCompletion,
  type ActiveWorkoutExercise,
  type ActiveWorkoutSet,
} from "../client/src/lib/activeWorkout";

type TestExercise = ActiveWorkoutExercise<{ name: string }> & {
  notes: string;
  restSeconds: number;
};

const sets: ActiveWorkoutSet[] = [
  { id: "set-1", setNumber: 1, weight: 40, reps: 10, weightUnit: "kg", completed: true, type: "normal" },
  { id: "set-2", setNumber: 2, weight: 45, reps: 8, weightUnit: "kg", completed: false, type: "warmup" },
];

const exercises: TestExercise[] = [
  { localId: "bench", exercise: { name: "Bench Press" }, sets, notes: "Control the descent", restSeconds: 90 },
  { localId: "row", exercise: { name: "Cable Row" }, sets: [], notes: "", restSeconds: 90 },
];

describe("active workout flow", () => {
  it("adds a set with the previous set's weight, reps, and unit", () => {
    const nextSets = addActiveSet(sets, "lbs", "set-3");

    expect(nextSets).toHaveLength(3);
    expect(nextSets[2]).toMatchObject({
      id: "set-3",
      setNumber: 3,
      weight: 45,
      reps: 8,
      weightUnit: "kg",
      completed: false,
      type: "normal",
    });
  });

  it("uses the selected global unit for the first set on an exercise", () => {
    const nextSets = addActiveSet([], "lbs", "first-set");

    expect(nextSets).toEqual([
      { id: "first-set", setNumber: 1, weight: 0, reps: 0, weightUnit: "lbs", completed: false, type: "normal" },
    ]);
  });

  it("removes a set and renumbers the remaining sets", () => {
    const nextSets = removeActiveSet(sets, "set-1");

    expect(nextSets).toHaveLength(1);
    expect(nextSets[0]).toMatchObject({ id: "set-2", setNumber: 1 });
  });

  it("updates only the targeted exercise's sets while a workout is active", () => {
    const revisedSets = [{ ...sets[0], reps: 12 }];
    const nextExercises = replaceExerciseSets(exercises, "bench", revisedSets);

    expect(nextExercises.find((exercise) => exercise.localId === "bench")?.sets[0].reps).toBe(12);
    expect(nextExercises.find((exercise) => exercise.localId === "row")?.sets).toEqual([]);
  });

  it("removes an exercise from an active workout without changing the others", () => {
    const nextExercises = removeActiveExercise(exercises, "bench");

    expect(nextExercises).toHaveLength(1);
    expect(nextExercises[0].localId).toBe("row");
  });

  it("adds an exercise to an already active workout", () => {
    const nextExercises = appendActiveExercise(exercises, {
      localId: "squat",
      exercise: { name: "Back Squat" },
      sets: [],
      notes: "",
      restSeconds: 120,
    });

    expect(nextExercises.map((exercise) => exercise.exercise.name)).toEqual(["Bench Press", "Cable Row", "Back Squat"]);
  });

  it("cycles editable set types in the intended order", () => {
    expect(cycleActiveSetType("normal")).toBe("warmup");
    expect(cycleActiveSetType("warmup")).toBe("dropset");
    expect(cycleActiveSetType("dropset")).toBe("failure");
    expect(cycleActiveSetType("failure")).toBe("normal");
  });

  it("can mark a set complete and make it editable again", () => {
    const completed = toggleActiveSetCompletion(sets, "set-2");
    const reopened = toggleActiveSetCompletion(completed, "set-2");

    expect(completed.find((set) => set.id === "set-2")?.completed).toBe(true);
    expect(reopened.find((set) => set.id === "set-2")?.completed).toBe(false);
  });

  it("only submits completed sets when a workout is finished", () => {
    const payload = completedExercisePayload(exercises);

    expect(payload).toEqual([
      {
        name: "Bench Press",
        sets: [{ reps: 10, weight: 40, weightUnit: "kg", type: "normal" }],
      },
    ]);
  });

  it("only allows completion after at least one set is marked complete", () => {
    expect(canFinishActiveWorkout(exercises)).toBe(true);
    expect(canFinishActiveWorkout([{ ...exercises[0], sets: sets.map((set) => ({ ...set, completed: false })) }])).toBe(false);
  });

  it("resets all active-workout state when a workout is cancelled", () => {
    expect(resetActiveWorkout()).toEqual({ name: "", exercises: [], startedAt: null });
  });

  it("uses persisted start time to restore elapsed time after a reload", () => {
    const startedAt = 1_000_000;
    const reloadedAt = startedAt + 92_800;

    expect(elapsedSeconds(startedAt, reloadedAt)).toBe(92);
  });

  it("never produces a negative elapsed time when a clock is adjusted", () => {
    expect(elapsedSeconds(1_000_000, 999_500)).toBe(0);
  });
});
