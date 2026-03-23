import { Sparkles, Zap, Target, Users, Flame, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TierPerk {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

interface TierPerksProps {
  tier: "Rookie" | "Prospect" | "Athlete" | "Beast" | "Elite" | "Legend";
  showAll?: boolean;
}

const TIER_PERKS: Record<string, TierPerk[]> = {
  Rookie: [
    {
      icon: <Sparkles size={20} />,
      title: "Starter Badge",
      description: "Display your Rookie badge on your profile",
      color: "from-slate-400 to-slate-600",
    },
  ],
  Prospect: [
    {
      icon: <Sparkles size={20} />,
      title: "Prospect Badge",
      description: "Unlock your Prospect badge",
      color: "from-blue-400 to-blue-600",
    },
    {
      icon: <Target size={20} />,
      title: "Custom Workout Notes",
      description: "Add detailed notes to your workouts",
      color: "from-blue-400 to-blue-600",
    },
  ],
  Athlete: [
    {
      icon: <Sparkles size={20} />,
      title: "Athlete Badge",
      description: "Unlock your Athlete badge",
      color: "from-amber-400 to-amber-600",
    },
    {
      icon: <Target size={20} />,
      title: "Workout Templates",
      description: "Save and reuse your favorite workouts",
      color: "from-amber-400 to-amber-600",
    },
    {
      icon: <Zap size={20} />,
      title: "2x XP Weekends",
      description: "Earn 2x XP on weekends",
      color: "from-amber-400 to-amber-600",
    },
  ],
  Beast: [
    {
      icon: <Sparkles size={20} />,
      title: "Beast Badge",
      description: "Unlock your Beast badge",
      color: "from-orange-400 to-red-600",
    },
    {
      icon: <Flame size={20} />,
      title: "Beast Mode",
      description: "Activate Beast Mode for 2x XP on all activities",
      color: "from-orange-400 to-red-600",
    },
    {
      icon: <Users size={20} />,
      title: "Priority Support",
      description: "Get priority customer support",
      color: "from-orange-400 to-red-600",
    },
    {
      icon: <Target size={20} />,
      title: "Advanced Analytics",
      description: "Access detailed workout analytics and insights",
      color: "from-orange-400 to-red-600",
    },
  ],
  Elite: [
    {
      icon: <Sparkles size={20} />,
      title: "Elite Badge",
      description: "Unlock your Elite badge",
      color: "from-purple-400 to-purple-600",
    },
    {
      icon: <Crown size={20} />,
      title: "Elite Status",
      description: "Display Elite status on your profile",
      color: "from-purple-400 to-purple-600",
    },
    {
      icon: <Zap size={20} />,
      title: "3x XP Weekends",
      description: "Earn 3x XP on weekends",
      color: "from-purple-400 to-purple-600",
    },
    {
      icon: <Users size={20} />,
      title: "Exclusive Community",
      description: "Join the Elite community with special events",
      color: "from-purple-400 to-purple-600",
    },
    {
      icon: <Target size={20} />,
      title: "AI Coach",
      description: "Get personalized AI coaching recommendations",
      color: "from-purple-400 to-purple-600",
    },
  ],
  Legend: [
    {
      icon: <Sparkles size={20} />,
      title: "Legend Badge",
      description: "Unlock your Legend badge",
      color: "from-yellow-300 to-yellow-500",
    },
    {
      icon: <Crown size={20} />,
      title: "Legend Status",
      description: "Display Legend status with golden crown",
      color: "from-yellow-300 to-yellow-500",
    },
    {
      icon: <Flame size={20} />,
      title: "Unlimited Beast Mode",
      description: "Activate Beast Mode anytime for unlimited XP boost",
      color: "from-yellow-300 to-yellow-500",
    },
    {
      icon: <Zap size={20} />,
      title: "5x XP Weekends",
      description: "Earn 5x XP on weekends",
      color: "from-yellow-300 to-yellow-500",
    },
    {
      icon: <Users size={20} />,
      title: "VIP Community",
      description: "Join VIP community with exclusive events & rewards",
      color: "from-yellow-300 to-yellow-500",
    },
    {
      icon: <Target size={20} />,
      title: "Premium AI Coach",
      description: "Get premium AI coaching with custom meal plans",
      color: "from-yellow-300 to-yellow-500",
    },
  ],
};

export default function TierPerks({ tier, showAll = false }: TierPerksProps) {
  const perks = TIER_PERKS[tier] || [];
  const displayPerks = showAll ? perks : perks.slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {displayPerks.map((perk, idx) => (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-lg border border-border bg-muted/30 p-4 transition hover:border-violet-500/50 hover:bg-muted/50"
          >
            {/* Gradient background */}
            <div className={cn("absolute inset-0 opacity-0 transition group-hover:opacity-10 bg-gradient-to-r", perk.color)} />

            <div className="relative z-10 flex gap-3">
              <div className="flex-shrink-0 text-violet-400 mt-0.5">{perk.icon}</div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{perk.title}</p>
                <p className="text-xs text-muted-foreground">{perk.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!showAll && perks.length > 3 && (
        <p className="text-xs text-muted-foreground text-center">
          +{perks.length - 3} more perks unlocked at this tier
        </p>
      )}
    </div>
  );
}
