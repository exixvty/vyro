import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import {
  Dumbbell, Flame, Play, ChevronRight, Apple, BarChart2, Trophy, Zap, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import TierBadge from "@/components/TierBadge";
import { AnimatedCounter, PressCard, ConfettiEffect } from "@/components/Interactive";
import { useTheme } from "@/contexts/ThemeContext";

const MOTIVATION: Record<string, string[]> = {
  fat_loss:            ["Burn it. Every rep is a step closer 🔥", "Stay in your deficit. You're doing great.", "Sweat is just fat crying 💧"],
  lean_bulk:           ["Feed the muscle. Hit your protein today 💪", "Fuel up. Gains don't grow on empty stomachs.", "Eat. Lift. Grow. Repeat. 🏋️"],
  muscle_gain:         ["Progressive overload is the key. Go heavier 🏋️", "Muscles grow in the kitchen AND the gym.", "One more rep. That's where growth lives."],
  athlete_performance: ["Speed. Strength. Endurance. Train all three ⚡", "Champions are made when no one's watching.", "Push your limits. Redefine possible."],
  general_fitness:     ["Consistency beats intensity. Show up today 🎯", "The only bad workout is the one you skipped.", "Progress, not perfection."],
};

// ─── Animated Ring ────────────────────────────────────────────────────────────
function Ring({ value, size = 64, stroke = 5, gradient }: {
  value: number; size?: number; stroke?: number; gradient: [string, string];
}) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, value) / 100) * circ;
  const id = `ring-${gradient[0].replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={gradient[0]} />
          <stop offset="100%" stopColor={gradient[1]} />
        </linearGradient>
      </defs>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="oklch(0.18 0.02 270)" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={`url(#${id})`} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)" }}
      />
    </svg>
  );
}

// ─── Animated XP Bar ─────────────────────────────────────────────────────────
function XPBar({ pct }: { pct: number }) {
  const [displayPct, setDisplayPct] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setDisplayPct(pct), 300);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div className="xp-bar">
      <div className="xp-fill" style={{ width: `${displayPct}%`, transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
    </div>
  );
}

// ─── Streak Badge ─────────────────────────────────────────────────────────────
function StreakBadge({ streak }: { streak: number }) {
  const [pop, setPop] = useState(false);
  useEffect(() => {
    if (streak > 0) {
      setPop(true);
      const t = setTimeout(() => setPop(false), 600);
      return () => clearTimeout(t);
    }
  }, [streak]);
  if (streak <= 0) return null;
  return (
    <div className={cn("flex items-center gap-1.5 mt-2", pop && "animate-streak-pop")}>
      <span className="text-lg fire-icon">🔥</span>
      <span className="text-sm font-semibold text-orange-400">{streak} day streak</span>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { customization } = useTheme();
  const [, navigate] = useLocation();
  const [today] = useMemo(() => [format(new Date(), "yyyy-MM-dd")], []);
  const [ctaConfetti, setCtaConfetti] = useState(false);
  const [entered, setEntered] = useState(false);

  const { data: profile }          = trpc.profile.get.useQuery();
  const { data: gameStats }        = trpc.gamification.getStats.useQuery();
  const { data: xpData }           = trpc.engagement.getXP.useQuery();
  const { data: recentSessions }   = trpc.workout.getSessions.useQuery({ limit: 3 });
  const { data: todayNutrition }   = trpc.nutrition.getDayLogs.useQuery({ date: today });
  const { data: nutritionGoals }   = trpc.nutrition.getGoals.useQuery();
  const { data: habitList }        = trpc.habits.list.useQuery();
  const { data: todayCompletions } = trpc.habits.getCompletions.useQuery({ date: today });

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(t);
  }, []);

  const totalCalories   = todayNutrition?.reduce((sum, l) => sum + l.calories, 0) ?? 0;
  const calorieGoal     = nutritionGoals?.dailyCalories ?? 2000;
  const calorieProgress = Math.min(100, (totalCalories / calorieGoal) * 100);
  const completedHabits = todayCompletions?.length ?? 0;
  const totalHabits     = habitList?.length ?? 0;
  const habitProgress   = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const goalKey        = profile?.primaryGoal ?? "";
  const msgs           = MOTIVATION[goalKey] ?? MOTIVATION["general_fitness"];
  const motivationMsg  = msgs[new Date().getDate() % msgs.length];

  const tier      = xpData?.currentTier ?? "Rookie";
  const level     = xpData?.currentLevel ?? 1;
  const totalXP   = xpData?.totalXP ?? 0;
  const xpInLevel = totalXP % 500;
  const xpPct     = Math.min(100, (xpInLevel / 500) * 100);
  const streak    = gameStats?.workoutStreak ?? 0;

  const handleStartWorkout = () => {
    setCtaConfetti(true);
    setTimeout(() => {
      navigate("/workout");
    }, 250);
  };

  return (
    <div className={cn(
      "min-h-screen bg-background text-foreground pb-28 overflow-x-hidden",
      entered ? "page-enter" : "opacity-0"
    )}>

      {/* ── Hero Header ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden px-5 pt-14 pb-8">
        {/* Ambient orbs */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground tracking-widest uppercase">{greeting()}</p>
            <h1 className="text-4xl font-display font-bold mt-1 leading-none">
              {user?.name?.split(" ")[0] || "Athlete"}
            </h1>
            <StreakBadge streak={streak} />
          </div>

          {/* Tier badge card */}
          <PressCard
            onClick={() => navigate("/tiers")}
            className="card-glow px-3 py-2.5 flex items-center gap-2.5"
          >
            <TierBadge tier={tier as any} level={level} size="sm" showLabel={false} />
            <div className="text-left">
              <p className="text-[10px] text-muted-foreground leading-none font-medium">{tier}</p>
              <p className="text-sm font-bold font-display leading-none mt-0.5 gradient-text">Lv.{level}</p>
            </div>
          </PressCard>
        </div>

        {/* XP Bar */}
        <div className="relative z-10 mt-5">
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="text-muted-foreground font-medium">
              <AnimatedCounter value={totalXP} suffix=" XP total" duration={1000} />
            </span>
            <span className="gradient-text font-semibold">{500 - xpInLevel} XP to level {level + 1}</span>
          </div>
          <XPBar pct={xpPct} />
        </div>
      </div>

      {/* ── Beast Mode Badge ─────────────────────────────────────────────── */}
      {customization.beastModeActive && (
        <div className="px-5 mb-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-orange-500/30 bg-orange-500/10 beast-reveal">
            <span className="text-base fire-icon">🔥</span>
            <span className="text-xs font-bold text-orange-400 tracking-wide">BEAST MODE ACTIVE — 2× XP</span>
          </div>
        </div>
      )}

      {/* ── Stat Pills ──────────────────────────────────────────────────────── */}
      <div className="px-5 mb-6 stagger-children">
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: <Dumbbell size={16} />,
              value: gameStats?.totalWorkouts ?? 0,
              label: "Workouts",
              grad: ["oklch(0.60 0.22 240)", "oklch(0.65 0.2 210)"] as [string,string],
              isNum: true,
            },
            {
              icon: <Flame size={16} />,
              value: streak,
              label: "Day Streak",
              grad: ["oklch(0.75 0.2 55)", "oklch(0.72 0.22 340)"] as [string,string],
              isNum: true,
            },
            {
              icon: <Zap size={16} />,
              value: level,
              label: "Current Level",
              grad: ["oklch(0.60 0.22 240)", "oklch(0.65 0.2 210)"] as [string,string],
              isNum: true,
            },
          ].map(({ icon, value, label, grad, isNum }, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl p-3.5 border border-white/5 press-scale hover-lift"
              style={{
                background: `linear-gradient(145deg, ${grad[0]}18, ${grad[1]}0a)`,
                boxShadow: `0 4px 20px ${grad[0]}20`,
              }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                style={{ background: `linear-gradient(135deg, ${grad[0]}40, ${grad[1]}20)` }}
              >
                <span style={{ color: grad[0] }}>{icon}</span>
              </div>
              <p className="text-xl font-display font-bold leading-none">
                {isNum ? (
                  <AnimatedCounter value={value as number} duration={900} />
                ) : (
                  `Lv.${value}`
                )}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{label}</p>
              {/* Decorative orb */}
              <div
                className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full opacity-20 blur-xl"
                style={{ background: grad[0] }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Start Workout CTA ───────────────────────────────────────────────── */}
      <div className="px-5 mb-6">
        <div className="relative">
          <ConfettiEffect active={ctaConfetti} count={28} className="rounded-3xl" />
          <button
            onClick={handleStartWorkout}
            className="w-full relative overflow-hidden rounded-3xl p-5 flex items-center justify-between group ripple press-scale-lg cta-pulse"
            style={{
              background: "var(--grad-primary)",
              boxShadow: "0 12px 40px oklch(0.60 0.22 240 / 0.45), 0 4px 16px oklch(0 0 0 / 0.3)",
            }}
          >
            {/* Noise overlay */}
            <div
              className="absolute inset-0 opacity-20 rounded-3xl"
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
              }}
            />

            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Play size={26} className="text-white" fill="white" />
              </div>
              <div className="text-left">
                <p className="font-display font-bold text-white text-xl leading-tight">Start Workout</p>
                <p className="text-white/70 text-sm mt-0.5">Build your session</p>
              </div>
            </div>
            <ChevronRight
              size={22}
              className="relative text-white/70 group-hover:translate-x-1.5 transition-transform duration-300"
            />
          </button>
        </div>
      </div>

      {/* ── Today's Progress ────────────────────────────────────────────────── */}
      <div className="px-5 mb-6">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3 font-semibold">Today</p>
        <div className="grid grid-cols-2 gap-3">
          {/* Calories */}
          <PressCard
            onClick={() => navigate("/nutrition")}
            className="relative overflow-hidden rounded-2xl p-4 border border-white/5 text-left hover-lift"
            style={{
              background: "linear-gradient(145deg, oklch(0.72 0.2 145 / 0.12), oklch(0.72 0.18 200 / 0.06))",
              boxShadow: "0 4px 20px oklch(0.72 0.2 145 / 0.15)",
            } as React.CSSProperties}
          >
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <Ring value={calorieProgress} size={56} gradient={["oklch(0.72 0.2 145)", "oklch(0.72 0.18 200)"]} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Apple size={14} style={{ color: "oklch(0.72 0.2 145)" }} />
                </div>
              </div>
              <div>
                <p className="text-xl font-display font-bold leading-none">
                  <AnimatedCounter value={totalCalories} duration={800} />
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">of {calorieGoal} kcal</p>
              </div>
            </div>
            <div
              className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full opacity-15 blur-2xl"
              style={{ background: "oklch(0.72 0.2 145)" }}
            />
          </PressCard>

          {/* Habits */}
          <PressCard
            onClick={() => navigate("/habits")}
            className="relative overflow-hidden rounded-2xl p-4 border border-white/5 text-left hover-lift"
            style={{
              background: "linear-gradient(145deg, oklch(0.75 0.2 55 / 0.12), oklch(0.72 0.22 340 / 0.06))",
              boxShadow: "0 4px 20px oklch(0.75 0.2 55 / 0.15)",
            } as React.CSSProperties}
          >
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <Ring value={habitProgress} size={56} gradient={["oklch(0.75 0.2 55)", "oklch(0.72 0.22 340)"]} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Flame size={14} style={{ color: "oklch(0.75 0.2 55)" }} />
                </div>
              </div>
              <div>
                <p className="text-xl font-display font-bold leading-none">
                  <AnimatedCounter value={completedHabits} duration={600} />
                  <span className="text-muted-foreground text-base">/{totalHabits}</span>
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">habits done</p>
              </div>
            </div>
            <div
              className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full opacity-15 blur-2xl"
              style={{ background: "oklch(0.75 0.2 55)" }}
            />
          </PressCard>
        </div>
      </div>

      {/* ── Motivation Banner ───────────────────────────────────────────────── */}
      <div className="px-5 mb-6">
        <div
          className="relative overflow-hidden rounded-2xl p-4 border border-white/5"
          style={{
            background: "linear-gradient(145deg, oklch(0.67 0.24 290 / 0.1), oklch(0.72 0.22 340 / 0.05))",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: "var(--grad-primary)", boxShadow: "0 4px 12px var(--vyro-glow)" }}
            >
              <Sparkles size={14} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">Daily Motivation</p>
              <p className="text-sm text-foreground leading-relaxed font-medium">{motivationMsg}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Workouts ─────────────────────────────────────────────────── */}
      {recentSessions && recentSessions.length > 0 && (
        <div className="px-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Recent Workouts</p>
            <button onClick={() => navigate("/workout")} className="text-xs font-semibold gradient-text">
              See all →
            </button>
          </div>
          <div className="space-y-2 stagger-children">
            {recentSessions.map((session) => (
              <PressCard
                key={session.id}
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-white/5 hover-lift"
                style={{
                  background: "var(--vyro-surface)",
                } as React.CSSProperties}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "var(--grad-primary)", boxShadow: "0 4px 12px var(--vyro-glow)" }}
                >
                  <Dumbbell size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{session.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {session.durationMinutes}min · {session.caloriesBurned || 0} kcal
                  </p>
                </div>
                <ChevronRight size={14} className="text-muted-foreground shrink-0" />
              </PressCard>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick Explore ───────────────────────────────────────────────────── */}
      <div className="px-5 mb-8">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-3">Explore</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Performance",
              sub: "Stats & trophies",
              icon: BarChart2,
              path: "/performance",
              grad: ["oklch(0.72 0.22 340)", "oklch(0.67 0.24 290)"] as [string,string],
            },
            {
              label: "Tiers & Ranks",
              sub: "Your progression",
              icon: Trophy,
              path: "/tiers",
              grad: ["oklch(0.80 0.2 85)", "oklch(0.75 0.2 55)"] as [string,string],
            },
          ].map(({ label, sub, icon: Icon, path, grad }) => (
            <PressCard
              key={path}
              onClick={() => navigate(path)}
              className="relative overflow-hidden rounded-2xl p-4 border border-white/5 text-left hover-lift hover-glow"
              style={{
                background: `linear-gradient(145deg, ${grad[0]}15, ${grad[1]}08)`,
                boxShadow: `0 4px 20px ${grad[0]}15`,
                "--vyro-glow": `${grad[0]}60`,
              } as React.CSSProperties}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `linear-gradient(135deg, ${grad[0]}40, ${grad[1]}20)` }}
              >
                <Icon size={18} style={{ color: grad[0] }} />
              </div>
              <p className="font-display font-bold text-sm">{label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
              <div
                className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full opacity-15 blur-2xl"
                style={{ background: grad[0] }}
              />
            </PressCard>
          ))}
        </div>
      </div>
    </div>
  );
}
