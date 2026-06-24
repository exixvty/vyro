import { trpc } from "@/lib/trpc";
import { Trophy, Star, Zap, Flame, Dumbbell, TrendingUp, Lock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";

const ALL_ACHIEVEMENTS = [
  { id: "first_workout", title: "First Rep", desc: "Complete your first workout", icon: "🏋️", xp: 100, category: "workout" },
  { id: "streak_3", title: "3-Day Streak", desc: "Work out 3 days in a row", icon: "🔥", xp: 150, category: "streak" },
  { id: "streak_7", title: "Week Warrior", desc: "7-day workout streak", icon: "⚡", xp: 300, category: "streak" },
  { id: "streak_30", title: "Iron Will", desc: "30-day workout streak", icon: "💎", xp: 1000, category: "streak" },
  { id: "workouts_10", title: "Getting Serious", desc: "Complete 10 workouts", icon: "💪", xp: 200, category: "workout" },
  { id: "workouts_50", title: "Dedicated", desc: "Complete 50 workouts", icon: "🏆", xp: 500, category: "workout" },
  { id: "workouts_100", title: "Century Club", desc: "Complete 100 workouts", icon: "👑", xp: 1500, category: "workout" },
  { id: "nutrition_7", title: "Nutrition Nerd", desc: "Log meals 7 days straight", icon: "🥗", xp: 200, category: "nutrition" },
  { id: "pr_first", title: "New Record", desc: "Set your first personal record", icon: "🎯", xp: 150, category: "strength" },
  { id: "pr_5", title: "PR Machine", desc: "Set 5 personal records", icon: "🚀", xp: 400, category: "strength" },
  { id: "habits_7", title: "Habit Builder", desc: "Complete all habits for 7 days", icon: "✅", xp: 250, category: "habits" },
  { id: "level_5", title: "Level 5", desc: "Reach level 5", icon: "⭐", xp: 500, category: "level" },
  { id: "level_10", title: "Level 10", desc: "Reach level 10", icon: "🌟", xp: 1000, category: "level" },
  { id: "social_share", title: "Social Butterfly", desc: "Share your first workout", icon: "📱", xp: 100, category: "social" },
  { id: "weight_loss_5", title: "5kg Down", desc: "Lose 5kg from starting weight", icon: "📉", xp: 500, category: "progress" },
];

const LEVEL_TITLES: Record<number, string> = {
  1: "Rookie", 2: "Trainee", 3: "Athlete", 4: "Competitor", 5: "Champion",
  6: "Elite", 7: "Master", 8: "Legend", 9: "Titan", 10: "God Mode",
};

function getLevelTitle(level: number) {
  if (level >= 10) return "God Mode";
  return LEVEL_TITLES[level] || `Level ${level}`;
}

function xpForLevel(l: number) { return l * l * 100; }

export default function GamificationDashboard() {
  const { data: stats } = trpc.gamification.getStats.useQuery();
  const { data: achievements } = trpc.gamification.getAchievements.useQuery();
  const [activeCategory, setActiveCategory] = useState("all");

  const level = stats?.level ?? 1;
  const xp = stats?.xp ?? 0;
  const currentLevelXP = xpForLevel(level - 1);
  const nextLevelXP = xpForLevel(level);
  const progress = Math.min(100, ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);
  const xpToNext = nextLevelXP - xp;

  const earnedIds = new Set(achievements?.map((a) => a.badgeId) ?? []);
  const earnedCount = earnedIds.size;

  const categories = ["all", "workout", "streak", "nutrition", "strength", "habits", "level", "social", "progress"];
  const filteredAchievements = ALL_ACHIEVEMENTS.filter(
    (a) => activeCategory === "all" || a.category === activeCategory
  );

  return (
    <div className="space-y-5 pb-6">
      {/* Level Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-5 relative overflow-hidden"
      >
        {/* Glow bg */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
            <span className="text-3xl font-display font-black text-primary">{level}</span>
          </div>
          <div>
            <p className="text-xl font-display font-bold text-foreground">{getLevelTitle(level)}</p>
            <p className="text-sm text-muted-foreground">{xp.toLocaleString()} XP total</p>
          </div>
          <div className="ml-auto">
            <Star size={24} className="text-yellow-400" fill="currentColor" />
          </div>
        </div>

        <div className="mb-2">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Level {level}</span>
            <span className="text-muted-foreground">{xpToNext.toLocaleString()} XP to Level {level + 1}</span>
          </div>
          <div className="xp-bar">
            <div className="xp-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        {[
          { label: "Total Workouts", value: stats?.totalWorkouts ?? 0, icon: Dumbbell, color: "text-purple-400", bg: "bg-purple-400/10" },
          { label: "Best Streak", value: `${stats?.workoutStreak ?? 0} days`, icon: Flame, color: "text-orange-400", bg: "bg-orange-400/10" },
          { label: "Total Minutes", value: stats?.totalMinutes ?? 0, icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Achievements", value: `${earnedCount}/${ALL_ACHIEVEMENTS.length}`, icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-400/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-4">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-2", bg)}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-xl font-display font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border capitalize transition-all",
              activeCategory === cat ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground bg-card"
            )}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Achievements Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-3"
      >
        {filteredAchievements.map((achievement) => {
          const earned = earnedIds.has(achievement.id);
          return (
            <div
              key={achievement.id}
              className={cn(
                "p-4 rounded-2xl border transition-all",
                earned ? "border-primary/30 bg-primary/5" : "border-border bg-card opacity-60"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={cn("text-2xl", !earned && "grayscale")}>{achievement.icon}</span>
                {earned ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-semibold">EARNED</span>
                ) : (
                  <Lock size={14} className="text-muted-foreground" />
                )}
              </div>
              <p className="font-semibold text-sm text-foreground mb-0.5">{achievement.title}</p>
              <p className="text-[11px] text-muted-foreground mb-2 leading-tight">{achievement.desc}</p>
              <div className="flex items-center gap-1">
                <Zap size={10} className="text-primary" />
                <span className="text-[11px] font-semibold text-primary">+{achievement.xp} XP</span>
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
