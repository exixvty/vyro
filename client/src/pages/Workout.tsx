import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Brain,
  Zap,
  Play,
  Clock,
  Flame,
  Dumbbell,
  ChevronRight,
  Plus,
  CheckCircle2,
  Star,
  RotateCcw,
  Loader2,
  X,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

type Tab = "generate" | "quick" | "history";

export default function Workout() {
  const [activeTab, setActiveTab] = useState<Tab>("generate");
  const [showActiveWorkout, setShowActiveWorkout] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-display font-bold text-foreground mb-1">Workout</h1>
        <p className="text-muted-foreground text-sm">AI-powered training, built for you</p>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-5">
        <div className="flex gap-1 p-1 bg-muted rounded-xl">
          {(["generate", "quick", "history"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all",
                activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              {tab === "generate" ? "AI Plan" : tab === "quick" ? "Quick" : "History"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "generate" && (
        <GeneratePlan onStart={(workout) => { setActiveWorkout(workout); setShowActiveWorkout(true); }} />
      )}
      {activeTab === "quick" && (
        <QuickWorkout onStart={(workout) => { setActiveWorkout(workout); setShowActiveWorkout(true); }} />
      )}
      {activeTab === "history" && <WorkoutHistory />}

      {/* Active Workout Modal */}
      {showActiveWorkout && activeWorkout && (
        <ActiveWorkoutModal
          workout={activeWorkout}
          onClose={() => setShowActiveWorkout(false)}
        />
      )}
    </div>
  );
}

function GeneratePlan({ onStart }: { onStart: (w: any) => void }) {
  const { data: profile } = trpc.profile.get.useQuery();
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [equipment, setEquipment] = useState("full gym");
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  const generatePlan = trpc.workout.generatePlan.useMutation({
    onSuccess: (data) => {
      setGeneratedPlan(data.plan);
      toast.success("Workout plan generated! +50 XP 🎉");
    },
    onError: () => toast.error("Failed to generate plan"),
  });

  const { data: plans } = trpc.workout.getPlans.useQuery();

  return (
    <div className="px-5 space-y-5 pb-6">
      {/* Profile summary */}
      {profile && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain size={16} className="text-primary" />
            <span className="text-sm font-semibold">Your Profile</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              profile.primaryGoal?.replace(/_/g, " "),
              profile.fitnessLevel,
              profile.athleteType,
            ].filter(Boolean).map((tag) => (
              <span key={tag} className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium capitalize">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Config */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
        <h3 className="font-semibold text-sm">Plan Settings</h3>

        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Days per week: {daysPerWeek}</label>
          <input
            type="range" min={2} max={6} value={daysPerWeek}
            onChange={(e) => setDaysPerWeek(+e.target.value)}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>2 days</span><span>6 days</span>
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Duration: {durationWeeks} weeks</label>
          <input
            type="range" min={2} max={12} value={durationWeeks}
            onChange={(e) => setDurationWeeks(+e.target.value)}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>2 weeks</span><span>12 weeks</span>
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Equipment</label>
          <div className="flex gap-2 flex-wrap">
            {["full gym", "home", "bodyweight", "dumbbells only"].map((eq) => (
              <button
                key={eq}
                onClick={() => setEquipment(eq)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all capitalize",
                  equipment === eq ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground"
                )}
              >
                {eq}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button
        className="w-full h-14 rounded-2xl glow-primary font-semibold"
        disabled={generatePlan.isPending}
        onClick={() => generatePlan.mutate({
          goal: profile?.primaryGoal || "general_fitness",
          fitnessLevel: profile?.fitnessLevel || "intermediate",
          athleteType: profile?.athleteType || "general",
          daysPerWeek,
          durationWeeks,
          equipment,
        })}
      >
        {generatePlan.isPending ? (
          <><Loader2 size={18} className="mr-2 animate-spin" />Generating with AI...</>
        ) : (
          <><Brain size={18} className="mr-2" />Generate AI Plan</>
        )}
      </Button>

      {/* Generated plan preview */}
      {generatedPlan && (
        <div className="bg-card border border-primary/30 rounded-2xl p-4 animate-scale-in">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} className="text-primary" fill="currentColor" />
            <h3 className="font-semibold text-foreground">{generatedPlan.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{generatedPlan.description}</p>
          {generatedPlan.weeks?.[0]?.days?.slice(0, 3).map((day: any, i: number) => (
            <div key={i} className="flex items-center gap-3 py-2 border-t border-border/50">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">D{day.dayNumber}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{day.name}</p>
                <p className="text-xs text-muted-foreground">{day.exercises?.length || 0} exercises</p>
              </div>
            </div>
          ))}
          <Button
            className="w-full mt-4 rounded-xl"
            onClick={() => onStart({ title: generatedPlan.title, exercises: generatedPlan.weeks?.[0]?.days?.[0]?.exercises || [] })}
          >
            <Play size={16} className="mr-2" />Start Week 1, Day 1
          </Button>
        </div>
      )}

      {/* Saved plans */}
      {plans && plans.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-3">Saved Plans</h3>
          <div className="space-y-2">
            {plans.map((plan) => (
              <div key={plan.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Dumbbell size={18} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-foreground">{plan.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{plan.difficulty} · {plan.daysPerWeek}x/week</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => onStart({ title: plan.title, exercises: [] })}>
                  <Play size={14} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QuickWorkout({ onStart }: { onStart: (w: any) => void }) {
  const [time, setTime] = useState(30);
  const [energy, setEnergy] = useState<"low" | "medium" | "high">("medium");
  const [focus, setFocus] = useState("full body");
  const [result, setResult] = useState<any>(null);

  const quickWorkout = trpc.workout.quickWorkout.useMutation({
    onSuccess: (data) => setResult(data),
    onError: () => toast.error("Failed to generate workout"),
  });

  return (
    <div className="px-5 space-y-5 pb-6">
      <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Time available: {time} min</label>
          <input type="range" min={10} max={90} step={5} value={time}
            onChange={(e) => setTime(+e.target.value)} className="w-full accent-primary" />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Energy level</label>
          <div className="flex gap-2">
            {(["low", "medium", "high"] as const).map((e) => (
              <button key={e} onClick={() => setEnergy(e)}
                className={cn("flex-1 py-2 rounded-xl text-sm font-medium border capitalize transition-all",
                  energy === e ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground")}>
                {e === "low" ? "😴" : e === "medium" ? "💪" : "🔥"} {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Focus area</label>
          <div className="flex gap-2 flex-wrap">
            {["full body", "upper", "lower", "core", "cardio"].map((f) => (
              <button key={f} onClick={() => setFocus(f)}
                className={cn("px-3 py-1.5 rounded-xl text-xs font-medium border capitalize transition-all",
                  focus === f ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground")}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button className="w-full h-14 rounded-2xl glow-primary font-semibold"
        disabled={quickWorkout.isPending}
        onClick={() => quickWorkout.mutate({ timeMinutes: time, energyLevel: energy, focus })}>
        {quickWorkout.isPending ? <><Loader2 size={18} className="mr-2 animate-spin" />Generating...</> : <><Zap size={18} className="mr-2" />Quick Generate</>}
      </Button>

      {result && (
        <div className="bg-card border border-primary/30 rounded-2xl p-4 animate-scale-in">
          <h3 className="font-semibold mb-3">{result.title}</h3>
          <div className="space-y-2 mb-4">
            {result.exercises?.slice(0, 6).map((ex: any, i: number) => (
              <div key={i} className="flex items-center gap-3 py-2 border-t border-border/50">
                <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{ex.name}</p>
                  <p className="text-xs text-muted-foreground">{ex.reps || ex.duration} · Rest {ex.rest}</p>
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full rounded-xl" onClick={() => onStart(result)}>
            <Play size={16} className="mr-2" />Start Now
          </Button>
        </div>
      )}
    </div>
  );
}

function WorkoutHistory() {
  const { data: sessions } = trpc.workout.getSessions.useQuery({ limit: 20 });

  if (!sessions?.length) {
    return (
      <div className="px-5 flex flex-col items-center justify-center py-20 text-center">
        <Dumbbell size={48} className="text-muted-foreground/30 mb-4" />
        <p className="font-semibold text-foreground">No workouts yet</p>
        <p className="text-sm text-muted-foreground">Complete your first workout to see history</p>
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
              <p className="text-xs text-muted-foreground capitalize">{session.type}</p>
            </div>
            <div className="flex">
              {Array.from({ length: session.rating || 3 }).map((_, i) => (
                <Star key={i} size={12} className="text-yellow-400" fill="currentColor" />
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock size={12} />{session.durationMinutes}min
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

function ActiveWorkoutModal({ workout, onClose }: { workout: any; onClose: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [rating, setRating] = useState(4);
  const [finished, setFinished] = useState(false);

  const logSession = trpc.workout.logSession.useMutation({
    onSuccess: (data) => {
      toast.success(`Workout complete! +${data.xpEarned} XP 💪`);
      onClose();
    },
  });

  const exercises = workout.exercises || [];

  const handleFinish = () => {
    logSession.mutate({
      title: workout.title,
      type: "strength",
      durationMinutes: Math.max(1, Math.floor(elapsed / 60)),
      caloriesBurned: Math.floor(elapsed / 60) * 8,
      exercises: exercises,
      rating,
    });
  };

  // Timer
  useState(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  });

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col max-w-[430px] mx-auto">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-foreground">{workout.title}</h2>
          <p className="text-muted-foreground text-sm">Active workout</p>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
          <X size={18} />
        </button>
      </div>

      {/* Timer */}
      <div className="px-5 mb-5">
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 text-center">
          <p className="text-5xl font-display font-bold text-primary">{formatTime(elapsed)}</p>
          <p className="text-sm text-muted-foreground mt-1">Elapsed time</p>
        </div>
      </div>

      {/* Exercises */}
      <div className="flex-1 px-5 overflow-y-auto scrollbar-hide">
        <div className="space-y-2">
          {exercises.length > 0 ? exercises.map((ex: any, i: number) => (
            <button
              key={i}
              onClick={() => {
                const next = new Set(completedExercises);
                if (next.has(i)) next.delete(i); else next.add(i);
                setCompletedExercises(next);
              }}
              className={cn(
                "w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left",
                completedExercises.has(i)
                  ? "border-green-500/50 bg-green-500/10"
                  : "border-border bg-card"
              )}
            >
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                completedExercises.has(i) ? "bg-green-500/20" : "bg-muted")}>
                {completedExercises.has(i)
                  ? <CheckCircle2 size={16} className="text-green-500" />
                  : <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>}
              </div>
              <div className="flex-1">
                <p className={cn("font-medium text-sm", completedExercises.has(i) ? "line-through text-muted-foreground" : "text-foreground")}>
                  {ex.name}
                </p>
                <p className="text-xs text-muted-foreground">{ex.sets && `${ex.sets} sets × `}{ex.reps} · Rest {ex.rest}</p>
              </div>
            </button>
          )) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Freestyle workout — track your own exercises</p>
            </div>
          )}
        </div>
      </div>

      {/* Finish */}
      <div className="px-5 py-5">
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} onClick={() => setRating(s)}>
              <Star size={24} className={s <= rating ? "text-yellow-400" : "text-muted"} fill={s <= rating ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
        <Button
          className="w-full h-14 rounded-2xl glow-primary font-semibold"
          onClick={handleFinish}
          disabled={logSession.isPending}
        >
          {logSession.isPending ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Trophy size={18} className="mr-2" />}
          Finish Workout
        </Button>
      </div>
    </div>
  );
}
