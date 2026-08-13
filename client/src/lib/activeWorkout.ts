export type ActiveWorkoutUnit = "kg" | "lbs";
export type ActiveSetType = "normal" | "warmup" | "dropset" | "failure";

export interface ActiveWorkoutSet {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  weightUnit: ActiveWorkoutUnit;
  completed: boolean;
  type: ActiveSetType;
}

export interface ActiveWorkoutExercise<TExercise = unknown> {
  localId: string;
  exercise: TExercise;
  sets: ActiveWorkoutSet[];
}

export function appendActiveExercise<T extends ActiveWorkoutExercise>(exercises: T[], exercise: T): T[] {
  return [...exercises, exercise];
}

export function replaceExerciseSets<T extends ActiveWorkoutExercise>(
  exercises: T[],
  localId: string,
  sets: ActiveWorkoutSet[]
): T[] {
  return exercises.map((exercise) =>
    exercise.localId === localId ? { ...exercise, sets } : exercise
  ) as T[];
}

export function removeActiveExercise<T extends ActiveWorkoutExercise>(exercises: T[], localId: string): T[] {
  return exercises.filter((exercise) => exercise.localId !== localId);
}

export function addActiveSet(
  sets: ActiveWorkoutSet[],
  weightUnit: ActiveWorkoutUnit,
  id: string
): ActiveWorkoutSet[] {
  const previousSet = sets.at(-1);
  return [
    ...sets,
    {
      id,
      setNumber: sets.length + 1,
      weight: previousSet?.weight ?? 0,
      reps: previousSet?.reps ?? 0,
      weightUnit: previousSet?.weightUnit ?? weightUnit,
      completed: false,
      type: "normal",
    },
  ];
}

export function removeActiveSet(sets: ActiveWorkoutSet[], setId: string): ActiveWorkoutSet[] {
  return sets
    .filter((set) => set.id !== setId)
    .map((set, index) => ({ ...set, setNumber: index + 1 }));
}

export function cycleActiveSetType(type: ActiveSetType): ActiveSetType {
  const types: ActiveSetType[] = ["normal", "warmup", "dropset", "failure"];
  return types[(types.indexOf(type) + 1) % types.length];
}

export function toggleActiveSetCompletion(sets: ActiveWorkoutSet[], setId: string): ActiveWorkoutSet[] {
  return sets.map((set) => (set.id === setId ? { ...set, completed: !set.completed } : set));
}

export function completedExercisePayload<T extends ActiveWorkoutExercise<{ name: string }>>(exercises: T[]) {
  return exercises
    .map((exercise) => ({
      name: exercise.exercise.name,
      sets: exercise.sets
        .filter((set) => set.completed)
        .map(({ reps, weight, weightUnit, type }) => ({ reps, weight, weightUnit, type })),
    }))
    .filter((exercise) => exercise.sets.length > 0);
}

export function elapsedSeconds(startedAt: number, now = Date.now()): number {
  return Math.max(0, Math.floor((now - startedAt) / 1000));
}

export function canFinishActiveWorkout<T extends ActiveWorkoutExercise>(exercises: T[]): boolean {
  return exercises.some((exercise) => exercise.sets.some((set) => set.completed));
}

export function resetActiveWorkout() {
  return { name: "", exercises: [] as ActiveWorkoutExercise[], startedAt: null as number | null };
}
