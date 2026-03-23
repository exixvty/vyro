import { useMemo, useState } from "react";
import { Trophy, TrendingUp, Zap, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import TierBadge from "@/components/TierBadge";
import TierPerks from "@/components/TierPerks";
import { Loader2, Sparkles } from "lucide-react";
import { AnimatedCounter, ProgressRing, PressCard } from "@/components/Interactive";

const TIER_PROGRESSION = [
  { tier: "Rookie", icon: "🥉", minXP: 0, maxXP: 499, color: "from-slate-400 to-slate-600" },
  { tier: "Prospect", icon: "🥈", minXP: 500, maxXP: 1499, color: "from-blue-400 to-blue-600" },
  { tier: "Athlete", icon: "🥇", minXP: 1500, maxXP: 3499, color: "from-amber-400 to-amber-600" },
  { tier: "Beast", icon: "🔥", minXP: 3500, maxXP: 6999, color: "from-orange-400 to-red-600" },
  { tier: "Elite", icon: "⚡", minXP: 7000, maxXP: 11999, color: "from-purple-400 to-purple-600" },
  { tier: "Legend", icon: "👑", minXP: 12000, maxXP: Infinity, color: "from-yellow-300 to-yellow-500" },
];

export default function Tiers() {
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  // Fetch user XP
  const { data: userXP, isLoading } = trpc.engagement.getXP.useQuery();

  // Mock leaderboard data (in production, fetch from server)
  const leaderboardData = useMemo(
    () => [
      { id: 1, name: "Alex Chen", tier: "Legend", level: 45, xp: 22500, avatar: "🏋️" },
      { id: 2, name: "Jordan Smith", tier: "Elite", level: 38, xp: 18900, avatar: "💪" },
      { id: 3, name: "Sam Johnson", tier: "Beast", level: 28, xp: 13500, avatar: "🔥" },
      { id: 4, name: "Casey Williams", tier: "Athlete", level: 18, xp: 8700, avatar: "🥇" },
      { id: 5, name: "Morgan Davis", tier: "Prospect", level: 12, xp: 5400, avatar: "🥈" },
    ],
    []
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-violet-500" size={40} />
      </div>
    );
  }

  const currentTierData = TIER_PROGRESSION.find((t) => t.tier === userXP?.currentTier);
  const userRank = 3; // Mock rank

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border p-4">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="text-violet-500" size={24} />
          <h1 className="text-2xl font-bold">Tier Rankings</h1>
        </div>
        <p className="text-sm text-muted-foreground">Your ranking and progression</p>
      </div>

      {/* Your Tier Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 rounded-2xl p-6 relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 blur-2xl" style={{ background: "var(--grad-primary)" }} />

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Current Tier</p>
              <h2 className="text-3xl font-display font-bold gradient-text">{userXP?.currentTier}</h2>
            </div>
            <ProgressRing
              value={Math.min(((userXP?.totalXP || 0) % 500) / 5, 100)}
              size={72}
              strokeWidth={5}
              color="var(--primary)"
            >
              <span className="text-xs font-bold text-foreground">
                {Math.round(Math.min(((userXP?.totalXP || 0) % 500) / 5, 100))}%
              </span>
            </ProgressRing>
          </div>

          {/* XP Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total XP</span>
              <span className="font-semibold gradient-text">
                <AnimatedCounter value={userXP?.totalXP || 0} duration={1000} suffix=" XP" />
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.min(((userXP?.totalXP || 0) % 500) / 5, 100)}%`,
                  background: "var(--grad-primary)",
                  boxShadow: "0 0 8px var(--vyro-glow)",
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              <AnimatedCounter value={500 - ((userXP?.totalXP || 0) % 500)} duration={800} suffix=" XP" /> to next level
            </p>
          </div>

          {/* Rank Badge */}
          <div className="mt-4 flex items-center gap-2 bg-background/50 rounded-xl p-3">
            <TrendingUp size={18} className="text-violet-400" />
            <span className="text-sm">
              You're ranked <span className="font-bold text-violet-400">#{userRank}</span> in the community
            </span>
          </div>
        </div>
      </div>

      {/* Tier Progression */}
      <div className="p-4">
        <h3 className="text-lg font-bold mb-4">Tier Progression</h3>
        <div className="space-y-2">
          {TIER_PROGRESSION.map((tier, idx) => {
            const isCurrentTier = tier.tier === userXP?.currentTier;
            const isCompleted = TIER_PROGRESSION.indexOf(tier) < TIER_PROGRESSION.indexOf(currentTierData || TIER_PROGRESSION[0]);

            return (
              <PressCard
                key={tier.tier}
                onClick={() => setSelectedTier(selectedTier === tier.tier ? null : tier.tier)}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 text-left",
                  isCurrentTier
                    ? "border-violet-500 bg-violet-500/10"
                    : isCompleted
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-border bg-muted/30 opacity-50"
                )}
                depth="sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl" style={isCurrentTier ? { filter: "drop-shadow(0 0 8px oklch(0.67 0.24 290 / 0.6))" } : {}}>{tier.icon}</span>
                    <div>
                      <p className={cn("font-bold", isCurrentTier && "gradient-text")}>{tier.tier}</p>
                      <p className="text-xs text-muted-foreground">{tier.minXP.toLocaleString()} - {tier.maxXP === Infinity ? "∞" : tier.maxXP.toLocaleString()} XP</p>
                    </div>
                  </div>
                  {isCurrentTier && <Zap size={20} className="text-violet-400 animate-pulse" />}
                  {isCompleted && !isCurrentTier && <span className="text-green-400 text-sm font-bold">✓ Unlocked</span>}
                </div>
              </PressCard>
            );
          })}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="p-4">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Trophy size={20} className="text-amber-400" />
          Top Players
        </h3>
        <div className="space-y-2">
          {leaderboardData.map((player, idx) => (
            <div key={player.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              {/* Rank */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center font-bold text-sm">
                #{idx + 1}
              </div>

              {/* Avatar & Name */}
              <div className="flex-1">
                <p className="font-semibold">{player.name}</p>
                <p className="text-xs text-muted-foreground">{player.tier} • Level {player.level}</p>
              </div>

              {/* XP */}
              <div className="text-right">
                <p className="font-bold text-violet-400">{player.xp.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">XP</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tier Perks Section */}
      <div className="p-4">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Sparkles size={20} className="text-violet-400" />
          Your Tier Perks
        </h3>
        <TierPerks tier={userXP?.currentTier || "Rookie"} />
      </div>

      {/* Tier Details Modal */}
      {selectedTier && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end">
          <div className="w-full bg-background rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="w-10 h-1 rounded-full bg-border mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-display font-bold">{selectedTier} Tier</h2>
              <button onClick={() => setSelectedTier(null)} className="p-2 hover:bg-muted rounded-xl transition press-scale">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center py-4">
                <TierBadge tier={selectedTier as any} level={20} size="lg" showLabel={false} />
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Reach the <span className="font-bold text-foreground">{selectedTier}</span> tier by earning XP through workouts, meals, streaks, and activities.
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-2">XP Range</p>
                <p className="font-bold text-lg">
                  {TIER_PROGRESSION.find((t) => t.tier === selectedTier)?.minXP.toLocaleString()} -{" "}
                  {TIER_PROGRESSION.find((t) => t.tier === selectedTier)?.maxXP === Infinity
                    ? "Unlimited"
                    : TIER_PROGRESSION.find((t) => t.tier === selectedTier)?.maxXP.toLocaleString()}{" "}
                  XP
                </p>
              </div>

              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Sparkles size={18} className="text-violet-400" />
                  Tier Perks
                </h3>
                <TierPerks tier={selectedTier as any} showAll />
              </div>

              <button
                onClick={() => setSelectedTier(null)}
                className="w-full py-3 bg-violet-500 hover:bg-violet-600 rounded-lg font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
