import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Flame,
  Dumbbell,
  TrendingUp,
  Trophy,
  ChevronRight,
  Play,
  Star,
  Activity,
  Apple,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

function XPBar({ xp, level }: { xp: number; level: number }) {
  const xpForLevel = (l: number) => l * l * 100;
  const currentLevelXP = xpForLevel(level - 1);
  const nextLevelXP = xpForLevel(level);
  const progress = Math.min(100, ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Level {level}</span>
          <span className="text-muted-foreground">{xp} XP</span>
        </div>
        <div className="xp-bar">
          <div className="xp-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: profile } = trpc.profile.get.useQuery();
  const { data: gameStats } = trpc.gamification.getStats.useQuery();
  const { data: recentSessions } = trpc.workout.getSessions.useQuery({ limit: 3 });
  const { data: todayNutrition } = trpc.nutrition.getDayLogs.useQuery({ date: today });
  const { data: nutritionGoals } = trpc.nutrition.getGoals.useQuery();
  const { data: habitList } = trpc.habits.list.useQuery();
  const { data: todayCompletions } = trpc.habits.getCompletions.useQuery({ date: today });

  const totalCalories = todayNutrition?.reduce((sum, log) => sum + log.calories, 0) ?? 0;
  const calorieGoal = nutritionGoals?.dailyCalories ?? 2000;
  const calorieProgress = Math.min(100, (totalCalories / calorieGoal) * 100);

  const completedHabits = todayCompletions?.length ?? 0;
  const totalHabits = habitList?.length ?? 0;

  const goalLabels: Record<string, string> = {
    fat_loss: "Fat Loss",
    lean_bulk: "Lean Bulk",
    muscle_gain: "Muscle Gain",
    athlete_performance: "Performance",
    general_fitness: "General Fitness",
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-muted-foreground text-sm">{greeting()},</p>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {user?.name?.split(" ")[0] || "Athlete"} 👋
            </h1>
          </div>
          <button
            onClick={() => navigate("/gamification")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border"
          >
            <Star size={14} className="text-yellow-400" fill="currentColor" />
            <span className="text-sm font-semibold text-foreground">Lvl {gameStats?.level ?? 1}</span>
          </button>
        </div>

        {/* XP bar */}
        <div className="mt-3">
          <XPBar xp={gameStats?.xp ?? 0} level={gameStats?.level ?? 1} />
        </div>
      </div>

      {/* Stats row */}
      <div className="px-5 mb-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Workouts", value: gameStats?.totalWorkouts ?? 0, icon: Dumbbell, color: "text-purple-400", bg: "bg-purple-400/10" },
            { label: "Streak", value: `${gameStats?.workoutStreak ?? 0}🔥`, icon: Flame, color: "text-orange-400", bg: "bg-orange-400/10" },
            { label: "Minutes", value: gameStats?.totalMinutes ?? 0, icon: Activity, color: "text-blue-400", bg: "bg-blue-400/10" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-card border border-border rounded-2xl p-3">
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-2", bg)}>
                <Icon size={16} className={color} />
              </div>
              <p className="text-lg font-display font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Start */}
      <div className="px-5 mb-5">
        <button
          onClick={() => navigate("/workout")}
          className="w-full p-5 rounded-2xl bg-primary glow-primary flex items-center justify-between group transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Play size={22} className="text-white" fill="white" />
            </div>
            <div className="text-left">
              <p className="font-display font-bold text-white text-lg">Start Workout</p>
              <p className="text-white/70 text-sm">AI-powered · Personalized</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-white/70 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Today's Overview */}
      <div className="px-5 mb-5">
        <h2 className="text-lg font-display font-semibold mb-3">Today's Overview</h2>
        <div className="grid grid-cols-2 gap-3">
          {/* Calories */}
          <button
            onClick={() => navigate("/nutrition")}
            className="bg-card border border-border rounded-2xl p-4 text-left"
          >
            <div className="flex items-center gap-2 mb-3">
              <Apple size={16} className="text-green-400" />
              <span className="text-xs font-medium text-muted-foreground">Calories</span>
            </div>
            <p className="text-xl font-display font-bold text-foreground">{Math.round(totalCalories)}</p>
            <p className="text-xs text-muted-foreground mb-2">of {calorieGoal} kcal</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${calorieProgress}%` }} />
            </div>
          </button>

          {/* Habits */}
          <button
            onClick={() => navigate("/habits")}
            className="bg-card border border-border rounded-2xl p-4 text-left"
          >
            <div className="flex items-center gap-2 mb-3">
              <Flame size={16} className="text-orange-400" />
              <span className="text-xs font-medium text-muted-foreground">Habits</span>
            </div>
            <p className="text-xl font-display font-bold text-foreground">
              {completedHabits}/{totalHabits}
            </p>
            <p className="text-xs text-muted-foreground mb-2">completed today</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: totalHabits > 0 ? `${(completedHabits / totalHabits) * 100}%` : "0%" }} />
            </div>
          </button>
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="px-5 mb-5">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain size={16} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">AI Insights</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {profile?.primaryGoal === "fat_loss"
              ? "You're on track! Aim for a 300-500 calorie deficit today. Consider a 30-min cardio session."
              : profile?.primaryGoal === "muscle_gain"
              ? "Protein intake is key today. Hit your strength workout and aim for 1.6-2.2g protein per kg bodyweight."
              : "Stay consistent with your training. Every workout counts toward your goals!"}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-primary hover:text-primary/80 px-0"
            onClick={() => navigate("/workout")}
          >
            Generate today's workout <ChevronRight size={14} className="ml-1" />
          </Button>
        </div>
      </div>

      {/* Recent Workouts */}
      {recentSessions && recentSessions.length > 0 && (
        <div className="px-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-display font-semibold">Recent Workouts</h2>
            <button onClick={() => navigate("/workout")} className="text-primary text-sm font-medium">
              See all
            </button>
          </div>
          <div className="space-y-2">
            {recentSessions.map((session) => (
              <div key={session.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Dumbbell size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{session.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.durationMinutes}min · {session.caloriesBurned || 0} kcal
                  </p>
                </div>
                <div className="flex">
                  {Array.from({ length: session.rating || 3 }).map((_, i) => (
                    <Star key={i} size={12} className="text-yellow-400" fill="currentColor" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goal banner */}
      <div className="px-5 mb-8">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border">
          <Trophy size={20} className="text-yellow-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              Goal: {goalLabels[profile?.primaryGoal || ""] || "Set your goal"}
            </p>
            <p className="text-xs text-muted-foreground">
              {profile?.fitnessLevel ? `${profile.fitnessLevel} level` : "Complete onboarding"}
            </p>
          </div>
          <button onClick={() => navigate("/settings")} className="text-primary">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
