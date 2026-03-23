import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Plus,
  Play,
  Clock,
  Dumbbell,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Star,
  Loader2,
  X,
  Trophy,
  Search,
  Timer,
  Flame,
  ArrowLeft,
  MoreHorizontal,
  Link2,
  Trash2,
  RotateCcw,
  Pause,
  Weight,
  Hash,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { useLocation } from "wouter";

/* ─── Types ───────────────────────────────────────────────────────────── */
interface ExerciseFromDB {
  id: number;
  name: string;
  category: string;
  type: string;
  difficulty: string;
  equipment: any;
  muscleGroups: any;
  description: string | null;
}

interface SetData {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  weightUnit: "kg" | "lbs";
  completed: boolean;
  rpe?: number;
  type: "normal" | "warmup" | "dropset" | "failure";
}

interface WorkoutExercise {
  localId: string;
  exercise: ExerciseFromDB;
  sets: SetData[];
  supersetGroup: number | null;
  notes: string;
  restSeconds: number;
}

/* ─── Main Workout Page ───────────────────────────────────────────────── */
export default function Workout() {
  const [, navigate] = useLocation();
  const [view, setView] = useState<"main" | "active">("main");
  const [workoutName, setWorkoutName] = useState("");
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  const [globalUnit, setGlobalUnit] = useState<"kg" | "lbs">("kg");

  const { data: sessions } = trpc.workout.getSessions.useQuery({ limit: 20 });

  const handleStartWorkout = () => {
    if (!workoutName.trim()) {
      toast.error("Give your workout a name");
      return;
    }
    if (workoutExercises.length === 0) {
      toast.error("Add at least one exercise");
      return;
    }
    setView("active");
  };

  const handleAddExercise = (ex: ExerciseFromDB) => {
    const newEx: WorkoutExercise = {
      localId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      exercise: ex,
      sets: [
        { id: `s1-${Date.now()}`, setNumber: 1, weight: 0, reps: 0, weightUnit: globalUnit, completed: false, type: "normal" },
        { id: `s2-${Date.now()}`, setNumber: 2, weight: 0, reps: 0, weightUnit: globalUnit, completed: false, type: "normal" },
        { id: `s3-${Date.now()}`, setNumber: 3, weight: 0, reps: 0, weightUnit: globalUnit, completed: false, type: "normal" },
      ],
      supersetGroup: null,
      notes: "",
      restSeconds: 90,
    };
    setWorkoutExercises((prev) => [...prev, newEx]);
    setShowExercisePicker(false);
    toast.success(`${ex.name} added`);
  };

  const handleRemoveExercise = (localId: string) => {
    setWorkoutExercises((prev) => prev.filter((e) => e.localId !== localId));
  };

  const handleUpdateSets = (localId: string, sets: SetData[]) => {
    setWorkoutExercises((prev) =>
      prev.map((e) => (e.localId === localId ? { ...e, sets } : e))
    );
  };

  const handleAddSet = (localId: string) => {
    setWorkoutExercises((prev) =>
      prev.map((e) => {
        if (e.localId !== localId) return e;
        const lastSet = e.sets[e.sets.length - 1];
        return {
          ...e,
          sets: [
            ...e.sets,
            {
              id: `s-${Date.now()}-${Math.random()}`,
              setNumber: e.sets.length + 1,
              weight: lastSet?.weight || 0,
              reps: lastSet?.reps || 0,
              weightUnit: lastSet?.weightUnit || globalUnit,
              completed: false,
              type: "normal" as const,
            },
          ],
        };
      })
    );
  };

  const handleRemoveSet = (localId: string, setId: string) => {
    setWorkoutExercises((prev) =>
      prev.map((e) => {
        if (e.localId !== localId) return e;
        const filtered = e.sets.filter((s) => s.id !== setId);
        return { ...e, sets: filtered.map((s, i) => ({ ...s, setNumber: i + 1 })) };
      })
    );
  };

  const handleToggleSuperset = (localId: string) => {
    setWorkoutExercises((prev) => {
      const idx = prev.findIndex((e) => e.localId === localId);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const groupId = prev[idx].supersetGroup || Date.now();
      return prev.map((e, i) => {
        if (i === idx || i === idx + 1) return { ...e, supersetGroup: e.supersetGroup ? null : groupId };
        return e;
      });
    });
  };

  if (view === "active") {
    return (
      <ActiveSession
        name={workoutName}
        exercises={workoutExercises}
        globalUnit={globalUnit}
        onUpdateSets={handleUpdateSets}
        onAddSet={handleAddSet}
        onRemoveSet={handleRemoveSet}
        onAddExercise={() => setShowExercisePicker(true)}
        onFinish={() => {
          setView("main");
          setWorkoutExercises([]);
          setWorkoutName("");
        }}
        onCancel={() => setView("main")}
        showExercisePicker={showExercisePicker}
        setShowExercisePicker={setShowExercisePicker}
        handleAddExercise={handleAddExercise}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-display font-bold text-foreground">Workout</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Build and track your training</p>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-5">
        <div className="flex gap-1 p-1 bg-muted rounded-xl">
          {(["new", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-all",
                activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              {tab === "new" ? "New Workout" : "History"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "new" ? (
        <div className="px-5 space-y-4">
          {/* Workout Name */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workout Name</label>
            <input
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="e.g. Push Day, Leg Day, Upper Body..."
              className="w-full h-12 px-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
            />
          </div>

          {/* Unit Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Weight Unit</span>
            <div className="flex gap-1 p-0.5 bg-muted rounded-lg">
              {(["kg", "lbs"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setGlobalUnit(u)}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-xs font-semibold transition-all",
                    globalUnit === u ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                  )}
                >
                  {u.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise List */}
          {workoutExercises.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Exercises ({workoutExercises.length})
                </span>
              </div>

              {workoutExercises.map((wex, idx) => (
                <ExerciseCard
                  key={wex.localId}
                  exercise={wex}
                  index={idx}
                  globalUnit={globalUnit}
                  onUpdateSets={(sets) => handleUpdateSets(wex.localId, sets)}
                  onAddSet={() => handleAddSet(wex.localId)}
                  onRemoveSet={(setId) => handleRemoveSet(wex.localId, setId)}
                  onRemove={() => handleRemoveExercise(wex.localId)}
                  onToggleSuperset={() => handleToggleSuperset(wex.localId)}
                  isLastExercise={idx === workoutExercises.length - 1}
                />
              ))}
            </div>
          )}

          {/* Add Exercise Button */}
          <button
            onClick={() => setShowExercisePicker(true)}
            className="w-full h-14 border-2 border-dashed border-border hover:border-primary/50 rounded-2xl flex items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-all"
          >
            <Plus size={20} />
            <span className="font-semibold text-sm">Add Exercise</span>
          </button>

          {/* Start Workout */}
          {workoutExercises.length > 0 && (
            <Button
              onClick={handleStartWorkout}
              className="w-full h-14 rounded-2xl font-semibold text-base glow-primary"
            >
              <Play size={18} className="mr-2" />
              Start Workout
            </Button>
          )}
        </div>
      ) : (
        <WorkoutHistory sessions={sessions} />
      )}

      {/* Exercise Picker Modal */}
      {showExercisePicker && (
        <ExercisePicker
          onSelect={handleAddExercise}
          onClose={() => setShowExercisePicker(false)}
        />
      )}
    </div>
  );
}

/* ─── Exercise Card (Hevy-style) ──────────────────────────────────────── */
function ExerciseCard({
  exercise,
  index,
  globalUnit,
  onUpdateSets,
  onAddSet,
  onRemoveSet,
  onRemove,
  onToggleSuperset,
  isLastExercise,
}: {
  exercise: WorkoutExercise;
  index: number;
  globalUnit: "kg" | "lbs";
  onUpdateSets: (sets: SetData[]) => void;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  onRemove: () => void;
  onToggleSuperset: () => void;
  isLastExercise: boolean;
}) {
  const [showMenu, setShowMenu] = useState(false);

  const updateSet = (setId: string, field: keyof SetData, value: any) => {
    onUpdateSets(
      exercise.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s))
    );
  };

  return (
    <div className={cn(
      "bg-card border rounded-2xl overflow-hidden transition-all",
      exercise.supersetGroup ? "border-primary/40 ring-1 ring-primary/20" : "border-border"
    )}>
      {/* Superset indicator */}
      {exercise.supersetGroup && (
        <div className="bg-primary/10 px-4 py-1.5 flex items-center gap-2">
          <Link2 size={12} className="text-primary" />
          <span className="text-xs font-semibold text-primary">Superset</span>
        </div>
      )}

      {/* Exercise Header */}
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Dumbbell size={16} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">{exercise.exercise.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{exercise.exercise.category} · {exercise.exercise.type}</p>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
            <MoreHorizontal size={16} className="text-muted-foreground" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 z-20 bg-card border border-border rounded-xl shadow-lg py-1 w-44">
              {!isLastExercise && (
                <button onClick={() => { onToggleSuperset(); setShowMenu(false); }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted flex items-center gap-2">
                  <Link2 size={14} /> {exercise.supersetGroup ? "Remove Superset" : "Superset with next"}
                </button>
              )}
              <button onClick={() => { onRemove(); setShowMenu(false); }}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted text-red-400 flex items-center gap-2">
                <Trash2 size={14} /> Remove Exercise
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sets Table Header */}
      <div className="px-4 grid grid-cols-[40px_1fr_1fr_1fr_40px] gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-2">
        <span className="text-center">Set</span>
        <span className="text-center">Previous</span>
        <span className="text-center">{globalUnit.toUpperCase()}</span>
        <span className="text-center">Reps</span>
        <span></span>
      </div>

      {/* Sets Rows */}
      <div className="px-4 space-y-1 pb-3">
        {exercise.sets.map((set) => (
          <div key={set.id} className={cn(
            "grid grid-cols-[40px_1fr_1fr_1fr_40px] gap-2 items-center py-1.5 rounded-lg transition-all",
            set.completed ? "bg-green-500/10" : ""
          )}>
            {/* Set Number / Type */}
            <button
              onClick={() => {
                const types: SetData["type"][] = ["normal", "warmup", "dropset", "failure"];
                const nextIdx = (types.indexOf(set.type) + 1) % types.length;
                updateSet(set.id, "type", types[nextIdx]);
              }}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold mx-auto",
                set.type === "warmup" ? "bg-yellow-500/20 text-yellow-400" :
                set.type === "dropset" ? "bg-blue-500/20 text-blue-400" :
                set.type === "failure" ? "bg-red-500/20 text-red-400" :
                "bg-muted text-muted-foreground"
              )}
            >
              {set.type === "warmup" ? "W" : set.type === "dropset" ? "D" : set.type === "failure" ? "F" : set.setNumber}
            </button>

            {/* Previous (placeholder) */}
            <div className="text-center text-xs text-muted-foreground/50">—</div>

            {/* Weight */}
            <input
              type="number"
              inputMode="decimal"
              value={set.weight || ""}
              onChange={(e) => updateSet(set.id, "weight", parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full h-8 bg-muted/60 border border-transparent focus:border-primary/40 rounded-lg text-center text-sm font-medium text-foreground outline-none transition-all"
            />

            {/* Reps */}
            <input
              type="number"
              inputMode="numeric"
              value={set.reps || ""}
              onChange={(e) => updateSet(set.id, "reps", parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-full h-8 bg-muted/60 border border-transparent focus:border-primary/40 rounded-lg text-center text-sm font-medium text-foreground outline-none transition-all"
            />

            {/* Delete Set */}
            <button
              onClick={() => onRemoveSet(set.id)}
              className="w-8 h-8 rounded-lg hover:bg-red-500/10 flex items-center justify-center mx-auto"
            >
              <Minus size={14} className="text-muted-foreground hover:text-red-400" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Set */}
      <button
        onClick={onAddSet}
        className="w-full py-2.5 text-xs font-semibold text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-1 border-t border-border/50"
      >
        <Plus size={14} /> Add Set
      </button>
    </div>
  );
}

/* ─── Active Session (Hevy-style live logging) ────────────────────────── */
function ActiveSession({
  name,
  exercises,
  globalUnit,
  onUpdateSets,
  onAddSet,
  onRemoveSet,
  onAddExercise,
  onFinish,
  onCancel,
  showExercisePicker,
  setShowExercisePicker,
  handleAddExercise,
}: {
  name: string;
  exercises: WorkoutExercise[];
  globalUnit: "kg" | "lbs";
  onUpdateSets: (localId: string, sets: SetData[]) => void;
  onAddSet: (localId: string) => void;
  onRemoveSet: (localId: string, setId: string) => void;
  onAddExercise: () => void;
  onFinish: () => void;
  onCancel: () => void;
  showExercisePicker: boolean;
  setShowExercisePicker: (v: boolean) => void;
  handleAddExercise: (ex: ExerciseFromDB) => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [restActive, setRestActive] = useState(false);
  const [rating, setRating] = useState(4);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const logSession = trpc.workout.logSession.useMutation({
    onSuccess: (data) => {
      toast.success(`Workout complete! +${data.xpEarned} XP`);
      onFinish();
    },
    onError: () => toast.error("Failed to save workout"),
  });

  // Elapsed timer
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Rest timer
  useEffect(() => {
    if (restActive && restTimer > 0) {
      restRef.current = setInterval(() => {
        setRestTimer((t) => {
          if (t <= 1) {
            setRestActive(false);
            toast("Rest complete! Next set.", { icon: "💪" });
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => { if (restRef.current) clearInterval(restRef.current); };
    }
  }, [restActive, restTimer]);

  const startRest = (seconds: number) => {
    setRestTimer(seconds);
    setRestActive(true);
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const totalSets = exercises.reduce((a, e) => a + e.sets.length, 0);
  const completedSets = exercises.reduce((a, e) => a + e.sets.filter((s) => s.completed).length, 0);
  const totalVolume = exercises.reduce((a, e) => a + e.sets.filter((s) => s.completed).reduce((b, s) => b + s.weight * s.reps, 0), 0);

  const handleCompleteSet = (localId: string, setId: string) => {
    const ex = exercises.find((e) => e.localId === localId);
    if (!ex) return;
    const set = ex.sets.find((s) => s.id === setId);
    if (!set) return;

    onUpdateSets(localId, ex.sets.map((s) => s.id === setId ? { ...s, completed: !s.completed } : s));

    if (!set.completed) {
      startRest(ex.restSeconds);
    }
  };

  const handleFinishWorkout = () => {
    const exerciseData = exercises.map((e) => ({
      name: e.exercise.name,
      sets: e.sets.filter((s) => s.completed).map((s) => ({
        reps: s.reps,
        weight: s.weight,
        weightUnit: s.weightUnit,
        type: s.type,
      })),
    }));

    logSession.mutate({
      title: name,
      type: "strength",
      durationMinutes: Math.max(1, Math.floor(elapsed / 60)),
      caloriesBurned: Math.round(totalVolume * 0.05),
      exercises: exerciseData,
      rating,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 pt-12 pb-3 flex items-center justify-between border-b border-border bg-background">
        <button onClick={onCancel} className="flex items-center gap-1 text-muted-foreground">
          <ArrowLeft size={18} />
          <span className="text-sm">Cancel</span>
        </button>
        <div className="text-center">
          <p className="font-display font-bold text-foreground text-sm">{name}</p>
          <p className="text-primary font-mono text-lg font-bold">{formatTime(elapsed)}</p>
        </div>
        <button
          onClick={() => setShowFinishModal(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          Finish
        </button>
      </div>

      {/* Rest Timer Banner */}
      {restActive && (
        <div className="px-4 py-3 bg-primary/10 border-b border-primary/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer size={16} className="text-primary" />
            <span className="text-sm font-semibold text-primary">Rest Timer</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-mono font-bold text-primary">
              {Math.floor(restTimer / 60)}:{String(restTimer % 60).padStart(2, "0")}
            </span>
            <button
              onClick={() => { setRestActive(false); setRestTimer(0); }}
              className="px-3 py-1 bg-primary/20 rounded-lg text-xs font-semibold text-primary"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="px-4 py-3 grid grid-cols-3 gap-3 border-b border-border/50">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{completedSets}/{totalSets}</p>
          <p className="text-xs text-muted-foreground">Sets</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{totalVolume.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Volume ({globalUnit})</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{exercises.length}</p>
          <p className="text-xs text-muted-foreground">Exercises</p>
        </div>
      </div>

      {/* Exercise Cards */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-32">
        {exercises.map((wex) => (
          <ActiveExerciseCard
            key={wex.localId}
            exercise={wex}
            globalUnit={globalUnit}
            onCompleteSet={(setId) => handleCompleteSet(wex.localId, setId)}
            onUpdateSets={(sets) => onUpdateSets(wex.localId, sets)}
            onAddSet={() => onAddSet(wex.localId)}
            onRemoveSet={(setId) => onRemoveSet(wex.localId, setId)}
          />
        ))}

        {/* Add Exercise during session */}
        <button
          onClick={onAddExercise}
          className="w-full py-4 border-2 border-dashed border-border hover:border-primary/50 rounded-2xl flex items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-all"
        >
          <Plus size={18} />
          <span className="font-semibold text-sm">Add Exercise</span>
        </button>
      </div>

      {/* Finish Modal */}
      {showFinishModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-end justify-center">
          <div className="bg-card w-full max-w-[430px] rounded-t-3xl p-6 space-y-5 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-foreground">Finish Workout?</h3>
              <button onClick={() => setShowFinishModal(false)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-foreground">{formatTime(elapsed)}</p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
              <div className="bg-muted rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-foreground">{completedSets}</p>
                <p className="text-xs text-muted-foreground">Sets Done</p>
              </div>
              <div className="bg-muted rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-primary">{totalVolume.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Volume</p>
              </div>
            </div>

            {/* Rating */}
            <div className="text-center">
              <p className="text-sm font-semibold text-muted-foreground mb-2">How was your workout?</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setRating(s)}>
                    <Star
                      size={28}
                      className={cn(s <= rating ? "text-yellow-400" : "text-muted")}
                      fill={s <= rating ? "currentColor" : "none"}
                    />
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleFinishWorkout}
              disabled={logSession.isPending}
              className="w-full h-14 rounded-2xl font-semibold text-base bg-green-600 hover:bg-green-700"
            >
              {logSession.isPending ? (
                <><Loader2 size={18} className="mr-2 animate-spin" />Saving...</>
              ) : (
                <><Trophy size={18} className="mr-2" />Complete Workout</>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Exercise Picker */}
      {showExercisePicker && (
        <ExercisePicker
          onSelect={handleAddExercise}
          onClose={() => setShowExercisePicker(false)}
        />
      )}
    </div>
  );
}

/* ─── Active Exercise Card ────────────────────────────────────────────── */
function ActiveExerciseCard({
  exercise,
  globalUnit,
  onCompleteSet,
  onUpdateSets,
  onAddSet,
  onRemoveSet,
}: {
  exercise: WorkoutExercise;
  globalUnit: "kg" | "lbs";
  onCompleteSet: (setId: string) => void;
  onUpdateSets: (sets: SetData[]) => void;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
}) {
  const updateSet = (setId: string, field: keyof SetData, value: any) => {
    onUpdateSets(
      exercise.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s))
    );
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-border/50">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Dumbbell size={16} className="text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm text-foreground">{exercise.exercise.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{exercise.exercise.category}</p>
        </div>
      </div>

      {/* Table Header */}
      <div className="px-4 pt-3 grid grid-cols-[36px_1fr_1fr_44px] gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest pb-2">
        <span className="text-center">Set</span>
        <span className="text-center">{globalUnit.toUpperCase()}</span>
        <span className="text-center">Reps</span>
        <span className="text-center">
          <CheckCircle2 size={12} className="mx-auto" />
        </span>
      </div>

      {/* Sets */}
      <div className="px-4 space-y-1 pb-3">
        {exercise.sets.map((set) => (
          <div key={set.id} className={cn(
            "grid grid-cols-[36px_1fr_1fr_44px] gap-2 items-center py-1 rounded-lg transition-all",
            set.completed ? "bg-green-500/10" : ""
          )}>
            <div className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold mx-auto",
              set.type === "warmup" ? "bg-yellow-500/20 text-yellow-400" :
              set.type === "dropset" ? "bg-blue-500/20 text-blue-400" :
              set.type === "failure" ? "bg-red-500/20 text-red-400" :
              set.completed ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"
            )}>
              {set.type === "warmup" ? "W" : set.type === "dropset" ? "D" : set.type === "failure" ? "F" : set.setNumber}
            </div>

            <input
              type="number"
              inputMode="decimal"
              value={set.weight || ""}
              onChange={(e) => updateSet(set.id, "weight", parseFloat(e.target.value) || 0)}
              placeholder="0"
              className={cn(
                "w-full h-8 rounded-lg text-center text-sm font-medium outline-none transition-all",
                set.completed ? "bg-green-500/10 text-green-300 border border-green-500/30" : "bg-muted/60 border border-transparent focus:border-primary/40 text-foreground"
              )}
            />

            <input
              type="number"
              inputMode="numeric"
              value={set.reps || ""}
              onChange={(e) => updateSet(set.id, "reps", parseInt(e.target.value) || 0)}
              placeholder="0"
              className={cn(
                "w-full h-8 rounded-lg text-center text-sm font-medium outline-none transition-all",
                set.completed ? "bg-green-500/10 text-green-300 border border-green-500/30" : "bg-muted/60 border border-transparent focus:border-primary/40 text-foreground"
              )}
            />

            <button
              onClick={() => onCompleteSet(set.id)}
              className={cn(
                "w-9 h-8 rounded-lg flex items-center justify-center mx-auto transition-all",
                set.completed ? "bg-green-500 text-white" : "bg-muted hover:bg-green-500/20"
              )}
            >
              <CheckCircle2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Set */}
      <button
        onClick={onAddSet}
        className="w-full py-2.5 text-xs font-semibold text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-1 border-t border-border/50"
      >
        <Plus size={14} /> Add Set
      </button>
    </div>
  );
}

/* ─── Exercise Picker (Full-screen modal) ─────────────────────────────── */
function ExercisePicker({
  onSelect,
  onClose,
}: {
  onSelect: (ex: ExerciseFromDB) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const { data: allExercises = [], isLoading } = trpc.exercises.getAll.useQuery();

  const categories = useMemo(() => {
    const cats = new Set(allExercises.map((e: any) => e.category));
    return ["all", ...Array.from(cats).sort()];
  }, [allExercises]);

  const filtered = useMemo(() => {
    return allExercises.filter((ex: any) => {
      if (category !== "all" && ex.category !== category) return false;
      if (search && !ex.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allExercises, search, category]);

  return (
    <div className="fixed inset-0 z-[70] bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 pt-12 pb-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-display font-bold text-foreground">Add Exercise</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 443+ exercises..."
            className="w-full h-10 pl-10 pr-4 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40"
            autoFocus
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all capitalize",
                category === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {cat === "all" ? `All (${allExercises.length})` : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Dumbbell size={40} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No exercises found</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filtered.map((ex: any) => {
              const equipment = typeof ex.equipment === "string" ? JSON.parse(ex.equipment) : ex.equipment;
              const muscles = typeof ex.muscleGroups === "string" ? JSON.parse(ex.muscleGroups) : ex.muscleGroups;
              return (
                <button
                  key={ex.id}
                  onClick={() => onSelect(ex)}
                  className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-muted/50 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Dumbbell size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{ex.name}</p>
                    <p className="text-xs text-muted-foreground capitalize truncate">
                      {ex.category} · {ex.type} · {ex.difficulty}
                    </p>
                    {Array.isArray(muscles) && muscles.length > 0 && (
                      <p className="text-[10px] text-muted-foreground/60 capitalize truncate mt-0.5">
                        {muscles.join(", ")}
                      </p>
                    )}
                  </div>
                  <Plus size={18} className="text-primary shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Workout History ─────────────────────────────────────────────────── */
function WorkoutHistory({ sessions }: { sessions: any[] | undefined }) {
  if (!sessions?.length) {
    return (
      <div className="px-5 flex flex-col items-center justify-center py-20 text-center">
        <Dumbbell size={48} className="text-muted-foreground/30 mb-4" />
        <p className="font-semibold text-foreground">No workouts yet</p>
        <p className="text-sm text-muted-foreground mt-1">Complete your first workout to see history</p>
      </div>
    );
  }

  return (
    <div className="px-5 space-y-3 pb-6">
      {sessions.map((session) => (
        <div key={session.id} className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-semibold text-foreground">{session.title}</p>
              <p className="text-xs text-muted-foreground capitalize">{session.type} · {format(new Date(session.completedAt), "MMM d, yyyy")}</p>
            </div>
            <div className="flex">
              {Array.from({ length: session.rating || 3 }).map((_, i) => (
                <Star key={i} size={12} className="text-yellow-400" fill="currentColor" />
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock size={12} />{session.durationMinutes || 0}min
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Flame size={12} />{session.caloriesBurned || 0} kcal
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
