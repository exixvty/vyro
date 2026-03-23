import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import {
  Dumbbell, Flame, Play, ChevronRight, Apple, BarChart2, Trophy, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import TierBadge from "@/components/TierBadge";

// ─── Motivational messages by goal ──────────────────────────────────────────
const MOTIVATION: Record<string, string> = {
  fat_loss: "Stay in your deficit. Every rep burns closer to your goal 🔥",
  lean_bulk: "Fuel the muscle. Hit your protein target today 💪",
  muscle_gain: "Progressive overload is the key. Push heavier today 🏋️",
  athlete_performance: "Speed, strength, endurance. Train all three today ⚡",
  general_fitness: "Consistency beats intensity. Show up today 🎯",
};

// ─── Ring Progress ────────────────────────────────────────────────────────────
function RingProgress({ value, size = 56, stroke = 5, color = "var(--primary)" }: {
  value: number; size?: number; stroke?: number; color?: string;
}) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, value) / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="oklch(0.22 0.02 270)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}

// ─── Quick Stat Pill ─────────────────────────────────────────────────────────
function StatPill({ icon, value, label, color }: {
  icon: React.ReactNode; value: string | number; label: string; color: string;
}) {
  return (
    <div className="flex-1 bg-card border border-border/50 rounded-2xl p-3 flex flex-col gap-1">
      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", color)}>
        {icon}
      </div>
      <p className="text-lg font-bold font-display leading-none">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [today] = useMemo(() => [format(new Date(), "yyyy-MM-dd")], []);

  const { data: profile } = trpc.profile.get.useQuery();
  const { data: gameStats } = trpc.gamification.getStats.useQuery();
  const { data: xpData } = trpc.engagement.getXP.useQuery();
  const { data: recentSessions } = trpc.workout.getSessions.useQuery({ limit: 3 });
  const { data: todayNutrition } = trpc.nutrition.getDayLogs.useQuery({ date: today });
  const { data: nutritionGoals } = trpc.nutrition.getGoals.useQuery();
  const { data: habitList } = trpc.habits.list.useQuery();
  const { data: todayCompletions } = trpc.habits.getCompletions.useQuery({ date: today });

  const totalCalories = todayNutrition?.reduce((sum, l) => sum + l.calories, 0) ?? 0;
  const calorieGoal = nutritionGoals?.dailyCalories ?? 2000;
  const calorieProgress = Math.min(100, (totalCalories / calorieGoal) * 100);
  const completedHabits = todayCompletions?.length ?? 0;
  const totalHabits = habitList?.length ?? 0;
  const habitProgress = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const motivationMsg = MOTIVATION[profile?.primaryGoal ?? ""] ?? "Show up today. Every session counts.";
  const tier = xpData?.currentTier ?? "Rookie";
  const level = xpData?.currentLevel ?? 1;
  const totalXP = xpData?.totalXP ?? 0;
  const xpProgress = Math.min(100, (totalXP % 500) / 5);

  return (
    <div className="min-h-screen bg-background text-foreground pb-28">

      {/* ── Header ── */}
      <div className="px-5 pt-12 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{greeting()}</p>
            <h1 className="text-2xl font-bold font-display mt-0.5">
              {user?.name?.split(" ")[0] || "Athlete"}
            </h1>
          </div>
          <button
            onClick={() => navigate("/tiers")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border/60"
          >
            <TierBadge tier={tier as any} level={level} size="sm" showLabel={false} />
            <div className="text-left">
              <p className="text-[10px] text-muted-foreground leading-none">{tier}</p>
              <p className="text-xs font-bold leading-none mt-0.5">Lv.{level}</p>
            </div>
          </button>
        </div>

        {/* XP bar */}
        <div className="mt-4">
          <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
            <span>{totalXP.toLocaleString()} XP</span>
            <span>{500 - (totalXP % 500)} XP to next level</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all duration-700"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="px-5 mb-5 flex gap-3">
        <StatPill
          icon={<Dumbbell size={14} className="text-violet-400" />}
          value={gameStats?.totalWorkouts ?? 0}
          label="Workouts"
          color="bg-violet-500/10"
        />
        <StatPill
          icon={<Flame size={14} className="text-orange-400" />}
          value={`${gameStats?.workoutStreak ?? 0}🔥`}
          label="Streak"
          color="bg-orange-500/10"
        />
        <StatPill
          icon={<Zap size={14} className="text-yellow-400" />}
          value={gameStats?.level ?? 1}
          label="Level"
          color="bg-yellow-500/10"
        />
      </div>

      {/* ── Start Workout CTA ── */}
      <div className="px-5 mb-5">
        <button
          onClick={() => navigate("/workout")}
          className="w-full p-5 rounded-2xl bg-primary flex items-center justify-between group transition-all active:scale-[0.98]"
          style={{ boxShadow: "0 8px 32px oklch(0.65 0.22 290 / 0.35)" }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Play size={22} className="text-white" fill="white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-white text-lg font-display leading-tight">Start Workout</p>
              <p className="text-white/70 text-sm">Build your session</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-white/70 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* ── Today's Rings ── */}
      <div className="px-5 mb-5">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Today</p>
        <div className="grid grid-cols-2 gap-3">
          {/* Calories ring */}
          <button
            onClick={() => navigate("/nutrition")}
            className="bg-card border border-border/50 rounded-2xl p-4 flex items-center gap-3 text-left"
          >
            <div className="relative shrink-0">
              <RingProgress value={calorieProgress} color="oklch(0.72 0.18 145)" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Apple size={14} className="text-green-400" />
              </div>
            </div>
            <div>
              <p className="text-lg font-bold font-display leading-none">{Math.round(totalCalories)}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">of {calorieGoal} kcal</p>
            </div>
          </button>

          {/* Habits ring */}
          <button
            onClick={() => navigate("/habits")}
            className="bg-card border border-border/50 rounded-2xl p-4 flex items-center gap-3 text-left"
          >
            <div className="relative shrink-0">
              <RingProgress value={habitProgress} color="oklch(0.72 0.18 55)" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Flame size={14} className="text-orange-400" />
              </div>
            </div>
            <div>
              <p className="text-lg font-bold font-display leading-none">{completedHabits}/{totalHabits}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">habits done</p>
            </div>
          </button>
        </div>
      </div>

      {/* ── Motivation Banner ── */}
      <div className="px-5 mb-5">
        <div className="bg-card border border-border/50 rounded-2xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Daily Motivation</p>
          <p className="text-sm text-foreground leading-relaxed">{motivationMsg}</p>
        </div>
      </div>

      {/* ── Recent Workouts ── */}
      {recentSessions && recentSessions.length > 0 && (
        <div className="px-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Recent</p>
            <button onClick={() => navigate("/workout")} className="text-xs text-primary font-medium">
              See all
            </button>
          </div>
          <div className="space-y-2">
            {recentSessions.map((session) => (
              <div key={session.id} className="flex items-center gap-3 p-3 bg-card border border-border/50 rounded-xl">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Dumbbell size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{session.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.durationMinutes}min · {session.caloriesBurned || 0} kcal
                  </p>
                </div>
                <ChevronRight size={14} className="text-muted-foreground shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick Links ── */}
      <div className="px-5 mb-8">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Explore</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Performance", icon: BarChart2, path: "/performance", color: "text-violet-400", bg: "bg-violet-500/10" },
            { label: "Tiers & Ranks", icon: Trophy, path: "/tiers", color: "text-yellow-400", bg: "bg-yellow-500/10" },
          ].map(({ label, icon: Icon, path, color, bg }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="bg-card border border-border/50 rounded-2xl p-4 flex items-center gap-3 text-left"
            >
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", bg)}>
                <Icon size={18} className={color} />
              </div>
              <p className="font-medium text-sm">{label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
