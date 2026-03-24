import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Zap, X, Star, Trophy, Flame, Crown } from "lucide-react";

interface LevelUpData {
  newLevel: number;
  oldLevel: number;
  newTier?: string;
  oldTier?: string;
  tierChanged?: boolean;
  xpEarned?: number;
}

interface LevelUpModalProps {
  data: LevelUpData | null;
  onClose: () => void;
}

/* ─── Tier config ────────────────────────────────────────────────────────── */
const TIER_CONFIG: Record<string, {
  color: string;
  gradient: string;
  glow: string;
  icon: React.ReactNode;
  messages: string[];
}> = {
  Rookie: {
    color: "oklch(0.65 0.1 270)",
    gradient: "linear-gradient(135deg, oklch(0.65 0.1 270), oklch(0.60 0.12 250))",
    glow: "oklch(0.65 0.1 270 / 0.4)",
    icon: <Star size={36} fill="currentColor" />,
    messages: [
      "Every legend started somewhere 🌱",
      "The journey of a thousand miles begins now 🚀",
      "You're just getting started — keep going! 💪",
      "Day one. The best day to begin 🔥",
    ],
  },
  Prospect: {
    color: "oklch(0.72 0.18 200)",
    gradient: "linear-gradient(135deg, oklch(0.72 0.18 200), oklch(0.65 0.2 220))",
    glow: "oklch(0.72 0.18 200 / 0.4)",
    icon: <Zap size={36} fill="currentColor" />,
    messages: [
      "You're showing real potential ⚡",
      "The grind is starting to pay off 💪",
      "Consistency is your superpower 🔥",
      "You're becoming a Prospect — keep building! 🚀",
    ],
  },
  Athlete: {
    color: "oklch(0.72 0.2 145)",
    gradient: "linear-gradient(135deg, oklch(0.72 0.2 145), oklch(0.65 0.2 165))",
    glow: "oklch(0.72 0.2 145 / 0.4)",
    icon: <Flame size={36} fill="currentColor" />,
    messages: [
      "You're becoming an Athlete 🏃‍♂️",
      "Your body is transforming. Keep pushing! 💪",
      "The hard work is showing 🔥",
      "Athlete status unlocked — you earned it! ⚡",
    ],
  },
  Beast: {
    color: "oklch(0.72 0.22 340)",
    gradient: "linear-gradient(135deg, oklch(0.72 0.22 340), oklch(0.67 0.24 290))",
    glow: "oklch(0.72 0.22 340 / 0.4)",
    icon: <Flame size={36} fill="currentColor" />,
    messages: [
      "You're becoming a Beast 🔥",
      "The Beast within is awakening 💀",
      "Unstoppable. Unbreakable. Beast Mode 🔥",
      "Most people quit. You didn't. Beast. 🦁",
    ],
  },
  Elite: {
    color: "oklch(0.67 0.24 290)",
    gradient: "linear-gradient(135deg, oklch(0.67 0.24 290), oklch(0.72 0.22 340))",
    glow: "oklch(0.67 0.24 290 / 0.4)",
    icon: <Crown size={36} fill="currentColor" />,
    messages: [
      "You're becoming Elite 🔥",
      "Elite status. Top 1% mentality 👑",
      "You're on another level now ⚡",
      "Elite. This is what dedication looks like 🏆",
    ],
  },
  Legend: {
    color: "oklch(0.80 0.2 85)",
    gradient: "linear-gradient(135deg, oklch(0.80 0.2 85), oklch(0.75 0.22 55))",
    glow: "oklch(0.80 0.2 85 / 0.5)",
    icon: <Trophy size={36} fill="currentColor" />,
    messages: [
      "LEGEND. You are the standard 🏆",
      "Legends are made, not born. You made it 👑",
      "You've reached the pinnacle. LEGEND 🌟",
      "The GOAT. Absolute Legend status 🔥",
    ],
  },
};

/* ─── Confetti particle ──────────────────────────────────────────────────── */
function Particle({
  delay, x, color, shape, size
}: { delay: number; x: number; color: string; shape: string; size: number }) {
  return (
    <div
      className={cn("absolute top-0", shape)}
      style={{
        left: `${x}%`,
        background: color,
        width: size,
        height: size,
        animation: `confetti-fall ${1.2 + Math.random() * 0.8}s ${delay}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) both`,
        transform: `rotate(${Math.random() * 360}deg)`,
      }}
    />
  );
}

/* ─── Streak milestone messages ──────────────────────────────────────────── */
export function getStreakMessage(streak: number): string | null {
  if (streak === 3)  return "3-day streak! You're building a habit 🔥";
  if (streak === 7)  return "7-day streak! One week strong 💪";
  if (streak === 14) return "14-day streak! Two weeks of consistency 🏆";
  if (streak === 30) return "30-day streak! You're a machine 👑";
  if (streak === 60) return "60-day streak! LEGENDARY dedication 🌟";
  if (streak === 100) return "100-day streak! You are UNSTOPPABLE 🔥";
  return null;
}

/* ─── Main Modal ─────────────────────────────────────────────────────────── */
export default function LevelUpModal({ data, onClose }: LevelUpModalProps) {
  const [visible, setVisible] = useState(false);
  const [particles, setParticles] = useState<Array<{
    id: number; x: number; delay: number; color: string; shape: string; size: number;
  }>>([]);
  const [showRays, setShowRays] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autoCloseRef = useRef<any>(undefined);

  const tier = data?.newTier ?? "Rookie";
  const config = TIER_CONFIG[tier] ?? TIER_CONFIG.Rookie;
  const motivationalMsg = useRef(
    config.messages[Math.floor(Math.random() * config.messages.length)]
  );

  // Update message when tier changes
  useEffect(() => {
    if (data?.newTier) {
      const cfg = TIER_CONFIG[data.newTier] ?? TIER_CONFIG.Rookie;
      motivationalMsg.current = cfg.messages[Math.floor(Math.random() * cfg.messages.length)];
    }
  }, [data?.newTier]);

  useEffect(() => {
    if (!data) {
      setVisible(false);
      setShowRays(false);
      return;
    }

    const cfg = TIER_CONFIG[data.newTier ?? "Rookie"] ?? TIER_CONFIG.Rookie;

    // Generate confetti
    const confettiColors = [
      cfg.color,
      "oklch(0.80 0.2 85)",
      "oklch(0.72 0.22 340)",
      "oklch(0.72 0.18 200)",
      "oklch(0.75 0.2 55)",
      "#ffffff",
      "oklch(0.67 0.24 290)",
    ];
    setParticles(
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 800,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        shape: Math.random() > 0.5 ? "rounded-full" : "rounded-sm",
        size: 4 + Math.random() * 8,
      }))
    );

    const t1 = setTimeout(() => setVisible(true), 50);
    const t2 = setTimeout(() => setShowRays(true), 300);
    autoCloseRef.current = setTimeout(() => handleClose(), 6000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleClose = () => {
    setVisible(false);
    setShowRays(false);
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    setTimeout(onClose, 350);
  };

  if (!data) return null;

  const cfg = TIER_CONFIG[tier] ?? TIER_CONFIG.Rookie;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      style={{
        background: visible ? "oklch(0 0 0 / 0.80)" : "oklch(0 0 0 / 0)",
        backdropFilter: visible ? "blur(16px)" : "blur(0px)",
        transition: "background 0.35s ease, backdrop-filter 0.35s ease",
      }}
      onClick={handleClose}
    >
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {visible && particles.map((p) => (
          <Particle key={p.id} x={p.x} delay={p.delay} color={p.color} shape={p.shape} size={p.size} />
        ))}
      </div>

      {/* Light rays */}
      {showRays && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${cfg.glow} 0%, transparent 70%)`,
            animation: "pulse-glow 2s ease-in-out infinite",
          }}
        />
      )}

      {/* Modal card */}
      <div
        className="relative w-full max-w-[360px] rounded-3xl overflow-hidden text-center"
        style={{
          background: "oklch(0.08 0.015 240)",
          border: `1px solid ${cfg.color}30`,
          boxShadow: `0 0 80px ${cfg.glow}, 0 0 40px ${cfg.glow}, 0 24px 80px oklch(0 0 0 / 0.7)`,
          transform: visible ? "scale(1) translateY(0)" : "scale(0.85) translateY(40px)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated gradient top strip */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ background: cfg.gradient }}
        />

        {/* Subtle background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${cfg.glow} 0%, transparent 60%)`,
            opacity: 0.3,
          }}
        />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-10"
        >
          <X size={14} className="text-white/70" />
        </button>

        <div className="relative px-8 pt-10 pb-8 z-10">
          {/* Icon with glow ring */}
          <div className="relative mx-auto mb-6 w-24 h-24 beast-reveal">
            {/* Outer ring */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `${cfg.color}15`,
                border: `2px solid ${cfg.color}40`,
                animation: "pulse-ring 2s ease-out infinite",
              }}
            />
            {/* Inner icon */}
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${cfg.color}30, ${cfg.color}15)`,
                boxShadow: `0 0 40px ${cfg.glow}, inset 0 1px 0 oklch(1 0 0 / 0.1)`,
                border: `1px solid ${cfg.color}40`,
                color: cfg.color,
              }}
            >
              {cfg.icon}
            </div>
          </div>

          {/* "LEVEL UP!" label */}
          <p
            className="text-xs font-bold tracking-[0.3em] uppercase mb-2"
            style={{ color: cfg.color, opacity: 0.8 }}
          >
            ⚡ Level Up! ⚡
          </p>

          {/* Level number — big and bold */}
          <h2
            className="text-6xl font-display font-extrabold mb-1 beast-reveal"
            style={{
              color: cfg.color,
              textShadow: `0 0 40px ${cfg.glow}`,
              animationDelay: "0.1s",
            }}
          >
            {data.newLevel}
          </h2>

          {/* Tier change badge */}
          {data.tierChanged && data.newTier && (
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mt-3 mb-1 beast-reveal"
              style={{
                background: `${cfg.color}20`,
                border: `1px solid ${cfg.color}50`,
                animationDelay: "0.15s",
              }}
            >
              <span className="text-sm font-bold" style={{ color: cfg.color }}>
                🏆 {data.oldTier} → {data.newTier}
              </span>
            </div>
          )}

          {/* Motivational message */}
          <p
            className="text-lg font-bold text-white mt-4 mb-1 beast-reveal leading-snug"
            style={{ animationDelay: "0.2s" }}
          >
            {motivationalMsg.current}
          </p>

          {/* XP earned */}
          {data.xpEarned && (
            <p
              className="text-sm font-semibold beast-reveal"
              style={{ color: cfg.color, animationDelay: "0.28s" }}
            >
              +{data.xpEarned} XP earned this session
            </p>
          )}

          {/* XP bar showing progress to next level */}
          <div
            className="mt-5 mb-5 beast-reveal"
            style={{ animationDelay: "0.32s" }}
          >
            <div className="flex justify-between text-xs text-white/40 mb-1.5">
              <span>Level {data.newLevel}</span>
              <span>Level {data.newLevel + 1}</span>
            </div>
            <div className="xp-bar">
              <div
                className="xp-fill"
                style={{ width: "5%", transition: "width 1.5s 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
              />
            </div>
          </div>

          {/* CTA button */}
          <button
            onClick={handleClose}
            className="w-full h-13 rounded-2xl font-bold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] beast-reveal"
            style={{
              background: cfg.gradient,
              boxShadow: `0 8px 32px ${cfg.glow}`,
              color: "oklch(0.08 0.01 240)",
              animationDelay: "0.38s",
              height: "52px",
            }}
          >
            Keep Going 🔥
          </button>
        </div>
      </div>
    </div>
  );
}
