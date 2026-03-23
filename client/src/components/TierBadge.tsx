import { cn } from "@/lib/utils";

interface TierBadgeProps {
  tier: "Rookie" | "Prospect" | "Athlete" | "Beast" | "Elite" | "Legend";
  level: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const TIER_CONFIG = {
  Rookie: {
    icon: "🥉",
    color: "from-slate-400 to-slate-600",
    textColor: "text-slate-300",
    bgColor: "bg-slate-900/50",
    borderColor: "border-slate-600",
  },
  Prospect: {
    icon: "🥈",
    color: "from-blue-400 to-blue-600",
    textColor: "text-blue-300",
    bgColor: "bg-blue-900/50",
    borderColor: "border-blue-600",
  },
  Athlete: {
    icon: "🥇",
    color: "from-amber-400 to-amber-600",
    textColor: "text-amber-300",
    bgColor: "bg-amber-900/50",
    borderColor: "border-amber-600",
  },
  Beast: {
    icon: "🔥",
    color: "from-orange-400 to-red-600",
    textColor: "text-orange-300",
    bgColor: "bg-red-900/50",
    borderColor: "border-red-600",
  },
  Elite: {
    icon: "⚡",
    color: "from-purple-400 to-purple-600",
    textColor: "text-purple-300",
    bgColor: "bg-purple-900/50",
    borderColor: "border-purple-600",
  },
  Legend: {
    icon: "👑",
    color: "from-yellow-300 to-yellow-500",
    textColor: "text-yellow-200",
    bgColor: "bg-yellow-900/50",
    borderColor: "border-yellow-500",
  },
};

const SIZE_CONFIG = {
  sm: { badge: "w-12 h-12", icon: "text-lg", text: "text-xs" },
  md: { badge: "w-16 h-16", icon: "text-2xl", text: "text-sm" },
  lg: { badge: "w-20 h-20", icon: "text-4xl", text: "text-base" },
};

export default function TierBadge({ tier, level, size = "md", showLabel = true }: TierBadgeProps) {
  const config = TIER_CONFIG[tier];
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full border-2 overflow-hidden",
          sizeConfig.badge,
          config.bgColor,
          config.borderColor,
          "shadow-lg"
        )}
      >
        {/* Gradient background */}
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-20", config.color)} />

        {/* Icon */}
        <span className={cn(sizeConfig.icon, "relative z-10")}>{config.icon}</span>

        {/* Level indicator */}
        <div
          className={cn(
            "absolute bottom-0 right-0 w-5 h-5 rounded-full flex items-center justify-center",
            config.bgColor,
            config.borderColor,
            "border text-xs font-bold",
            config.textColor
          )}
        >
          {level}
        </div>
      </div>

      {showLabel && (
        <div className="text-center">
          <p className={cn("font-bold", config.textColor)}>{tier}</p>
          <p className="text-xs text-muted-foreground">Level {level}</p>
        </div>
      )}
    </div>
  );
}
