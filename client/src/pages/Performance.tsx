import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { Loader2, Dumbbell, Clock, Flame, Repeat, TrendingUp, Award, Lock, ChevronRight, Zap, Star, Target, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import TierBadge from "@/components/TierBadge";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatVolume(kg: number) {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
  return `${kg.toLocaleString()}kg`;
}

function formatTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ─── Trophy Definitions ──────────────────────────────────────────────────────

const TROPHIES = [
  {
    id: "iron_will",
    name: "Iron Will",
    description: "Complete 10 workouts without missing a day",
    icon: "🔩",
    gradient: "from-slate-400 via-zinc-500 to-slate-600",
    glow: "shadow-[0_0_24px_rgba(148,163,184,0.4)]",
    requirement: 10,
    metric: "workouts",
    rarity: "Common",
    rarityColor: "text-slate-400",
    flavor: "The forge shapes iron. Consistency shapes champions.",
  },
  {
    id: "titan_lifter",
    name: "Titan Lifter",
    description: "Lift over 10,000 kg total volume",
    icon: "⚡",
    gradient: "from-amber-400 via-orange-500 to-red-500",
    glow: "shadow-[0_0_24px_rgba(251,146,60,0.5)]",
    requirement: 10000,
    metric: "volume",
    rarity: "Rare",
    rarityColor: "text-amber-400",
    flavor: "Mountains bow to those who carry the weight of legends.",
  },
  {
    id: "century_warrior",
    name: "Century Warrior",
    description: "Log 100 total sets across all workouts",
    icon: "🏛️",
    gradient: "from-violet-400 via-purple-500 to-indigo-600",
    glow: "shadow-[0_0_24px_rgba(167,139,250,0.5)]",
    requirement: 100,
    metric: "sets",
    rarity: "Epic",
    rarityColor: "text-violet-400",
    flavor: "A hundred battles fought. A warrior reborn.",
  },
  {
    id: "time_lord",
    name: "Time Lord",
    description: "Accumulate 1,000 minutes of training",
    icon: "⏳",
    gradient: "from-cyan-400 via-blue-500 to-indigo-500",
    glow: "shadow-[0_0_24px_rgba(34,211,238,0.4)]",
    requirement: 1000,
    metric: "minutes",
    rarity: "Rare",
    rarityColor: "text-cyan-400",
    flavor: "Time is the currency of greatness. Spend it wisely.",
  },
  {
    id: "rep_machine",
    name: "Rep Machine",
    description: "Complete 1,000 total reps",
    icon: "🤖",
    gradient: "from-green-400 via-emerald-500 to-teal-600",
    glow: "shadow-[0_0_24px_rgba(52,211,153,0.4)]",
    requirement: 1000,
    metric: "reps",
    rarity: "Common",
    rarityColor: "text-green-400",
    flavor: "Repetition is the mother of mastery.",
  },
  {
    id: "phantom_force",
    name: "Phantom Force",
    description: "Lift 100,000 kg total volume — a true legend",
    icon: "👻",
    gradient: "from-yellow-300 via-amber-400 to-yellow-500",
    glow: "shadow-[0_0_32px_rgba(252,211,77,0.6)]",
    requirement: 100000,
    metric: "volume",
    rarity: "Legendary",
    rarityColor: "text-yellow-300",
    flavor: "Few have walked this path. Fewer will.",
  },
];

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-card rounded-2xl p-4 flex flex-col gap-2 border border-border/50">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color)}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold font-display tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground/60 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Trophy Card ─────────────────────────────────────────────────────────────

function TrophyCard({
  trophy,
  stats,
  isShowcase,
  onToggleShowcase,
}: {
  trophy: typeof TROPHIES[0];
  stats: { workouts: number; volume: number; sets: number; minutes: number; reps: number };
  isShowcase: boolean;
  onToggleShowcase: () => void;
}) {
  const current = stats[trophy.metric as keyof typeof stats] ?? 0;
  const progress = Math.min(100, (current / trophy.requirement) * 100);
  const unlocked = progress >= 100;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border transition-all duration-300",
        unlocked
          ? "border-border/80 bg-card cursor-pointer hover:scale-[1.02]"
          : "border-border/30 bg-card/50 opacity-60"
      )}
      onClick={unlocked ? onToggleShowcase : undefined}
    >
      {/* Gradient top strip */}
      {unlocked && (
        <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r", trophy.gradient)} />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
                unlocked
                  ? cn("bg-gradient-to-br", trophy.gradient, trophy.glow)
                  : "bg-muted/50"
              )}
            >
              {unlocked ? trophy.icon : <Lock size={18} className="text-muted-foreground" />}
            </div>
            <div>
              <p className="font-bold text-sm">{trophy.name}</p>
              <p className={cn("text-xs font-medium", trophy.rarityColor)}>{trophy.rarity}</p>
            </div>
          </div>
          {unlocked && (
            <button
              className={cn(
                "text-xs px-2 py-1 rounded-lg font-medium transition",
                isShowcase
                  ? "bg-violet-500/20 text-violet-400 border border-violet-500/40"
                  : "bg-muted text-muted-foreground border border-border"
              )}
            >
              {isShowcase ? "★ Showcased" : "Showcase"}
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground mb-3">{trophy.description}</p>

        {unlocked ? (
          <p className="text-xs italic text-muted-foreground/70">"{trophy.flavor}"</p>
        ) : (
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Showcase Slot ────────────────────────────────────────────────────────────

function ShowcaseSlot({
  trophy,
  slotIndex,
}: {
  trophy: typeof TROPHIES[0] | null;
  slotIndex: number;
}) {
  if (!trophy) {
    return (
      <div className="flex-1 aspect-square rounded-2xl border-2 border-dashed border-border/40 flex flex-col items-center justify-center gap-2 text-muted-foreground/40">
        <Trophy size={24} />
        <p className="text-xs">Slot {slotIndex + 1}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex-1 aspect-square rounded-2xl relative overflow-hidden flex flex-col items-center justify-center gap-2",
        "bg-gradient-to-br",
        trophy.gradient,
        trophy.glow
      )}
    >
      <div className="absolute inset-0 bg-black/20" />
      <span className="relative text-3xl">{trophy.icon}</span>
      <p className="relative text-xs font-bold text-white text-center px-2 leading-tight">{trophy.name}</p>
      <p className={cn("relative text-[10px] font-medium", trophy.rarityColor.replace("text-", "text-white/"))}>{trophy.rarity}</p>
    </div>
  );
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Performance() {
  const { user } = useAuth();
  const [activeChart, setActiveChart] = useState<"volume" | "workouts" | "minutes">("volume");
  const [showcaseSlots, setShowcaseSlots] = useState<(string | null)[]>([null, null, null]);

  const { data: stats, isLoading } = trpc.workouts.getPerformanceStats.useQuery();
  const { data: xpData } = trpc.engagement.getXP.useQuery();

  const statValues = useMemo(() => ({
    workouts: stats?.totalWorkouts ?? 0,
    volume: stats?.totalVolumeKg ?? 0,
    sets: stats?.totalSets ?? 0,
    minutes: stats?.totalMinutes ?? 0,
    reps: stats?.totalReps ?? 0,
  }), [stats]);

  // Muscle distribution mock (in production, derive from exercise categories)
  const muscleData = useMemo(() => [
    { muscle: "Chest", value: 22 },
    { muscle: "Back", value: 28 },
    { muscle: "Legs", value: 20 },
    { muscle: "Shoulders", value: 12 },
    { muscle: "Arms", value: 10 },
    { muscle: "Core", value: 8 },
  ], []);

  const showcasedTrophies = showcaseSlots.map(id => TROPHIES.find(t => t.id === id) ?? null);

  function toggleShowcase(trophyId: string) {
    setShowcaseSlots(prev => {
      const existing = prev.indexOf(trophyId);
      if (existing !== -1) {
        // Remove from showcase
        const next = [...prev];
        next[existing] = null;
        return next;
      }
      // Add to first empty slot
      const emptySlot = prev.indexOf(null);
      if (emptySlot === -1) return prev; // all slots full
      const next = [...prev];
      next[emptySlot] = trophyId;
      return next;
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-violet-500" size={36} />
      </div>
    );
  }

  const chartData = stats?.weeklyStats ?? Array.from({ length: 8 }, (_, i) => ({
    week: `W${i + 1}`, volume: 0, workouts: 0, minutes: 0,
  }));

  const chartConfig = {
    volume: { color: "oklch(0.65 0.22 290)", label: "Volume (kg)" },
    workouts: { color: "oklch(0.72 0.18 145)", label: "Workouts" },
    minutes: { color: "oklch(0.72 0.18 55)", label: "Minutes" },
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-28">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Overview</p>
        <h1 className="text-3xl font-bold font-display">Performance</h1>
      </div>

      {/* ── Tier + XP Strip ── */}
      {xpData && (
        <div className="mx-5 mb-5 bg-card rounded-2xl p-4 border border-border/50 flex items-center gap-4">
          <TierBadge tier={xpData.currentTier as any} level={xpData.currentLevel} size="md" showLabel={false} />
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold">{xpData.currentTier}</span>
              <span className="text-muted-foreground">{xpData.totalXP.toLocaleString()} XP</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all"
                style={{ width: `${Math.min(100, (xpData.totalXP % 500) / 5)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Level {xpData.currentLevel}</p>
          </div>
        </div>
      )}

      {/* ── Core Stats Grid ── */}
      <div className="px-5 mb-5">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">All Time</p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Dumbbell size={16} className="text-violet-400" />}
            label="Total Workouts"
            value={statValues.workouts.toString()}
            color="bg-violet-500/10"
          />
          <StatCard
            icon={<TrendingUp size={16} className="text-amber-400" />}
            label="Volume Lifted"
            value={formatVolume(statValues.volume)}
            sub="total kg"
            color="bg-amber-500/10"
          />
          <StatCard
            icon={<Clock size={16} className="text-blue-400" />}
            label="Time Trained"
            value={formatTime(statValues.minutes)}
            color="bg-blue-500/10"
          />
          <StatCard
            icon={<Repeat size={16} className="text-green-400" />}
            label="Total Sets"
            value={statValues.sets.toLocaleString()}
            sub={`${statValues.reps.toLocaleString()} reps`}
            color="bg-green-500/10"
          />
        </div>
      </div>

      {/* ── Stats Over Time ── */}
      <div className="px-5 mb-5">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Stats Over Time</p>
        <div className="bg-card rounded-2xl p-4 border border-border/50">
          {/* Chart tabs */}
          <div className="flex gap-2 mb-4">
            {(["volume", "workouts", "minutes"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveChart(tab)}
                className={cn(
                  "flex-1 py-1.5 rounded-lg text-xs font-medium transition",
                  activeChart === tab
                    ? "bg-violet-500/20 text-violet-400 border border-violet-500/40"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartConfig[activeChart].color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartConfig[activeChart].color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.02 270)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "oklch(0.55 0.02 270)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "oklch(0.55 0.02 270)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={activeChart}
                stroke={chartConfig[activeChart].color}
                strokeWidth={2}
                fill="url(#areaGrad)"
                dot={false}
                activeDot={{ r: 4, fill: chartConfig[activeChart].color }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Muscle Distribution ── */}
      <div className="px-5 mb-5">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Muscle Distribution</p>
        <div className="bg-card rounded-2xl p-4 border border-border/50">
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={muscleData}>
              <PolarGrid stroke="oklch(0.22 0.02 270)" />
              <PolarAngleAxis dataKey="muscle" tick={{ fontSize: 11, fill: "oklch(0.65 0.02 270)" }} />
              <Radar
                name="Volume %"
                dataKey="value"
                stroke="oklch(0.65 0.22 290)"
                fill="oklch(0.65 0.22 290)"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {muscleData.map(m => (
              <div key={m.muscle} className="text-center">
                <p className="text-xs font-semibold">{m.value}%</p>
                <p className="text-[10px] text-muted-foreground">{m.muscle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Trophy Showcase ── */}
      <div className="px-5 mb-5">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Trophy Showcase</p>
        <div className="bg-card rounded-2xl p-4 border border-border/50">
          <p className="text-xs text-muted-foreground mb-4">Choose 3 trophies to display on your profile</p>
          <div className="flex gap-3 mb-2">
            {showcasedTrophies.map((t, i) => (
              <ShowcaseSlot key={i} trophy={t} slotIndex={i} />
            ))}
          </div>
        </div>
      </div>

      {/* ── All Trophies ── */}
      <div className="px-5">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">All Trophies</p>
        <div className="space-y-3">
          {TROPHIES.map(trophy => (
            <TrophyCard
              key={trophy.id}
              trophy={trophy}
              stats={statValues}
              isShowcase={showcaseSlots.includes(trophy.id)}
              onToggleShowcase={() => toggleShowcase(trophy.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
