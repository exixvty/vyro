import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Zap, X } from "lucide-react";

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

const TIER_COLORS: Record<string, string> = {
  Rookie:   "oklch(0.65 0.1 270)",
  Prospect: "oklch(0.72 0.18 200)",
  Athlete:  "oklch(0.72 0.2 145)",
  Beast:    "oklch(0.72 0.22 340)",
  Elite:    "oklch(0.67 0.24 290)",
  Legend:   "oklch(0.80 0.2 85)",
};

const BEAST_MESSAGES = [
  "You're becoming a Beast 🔥",
  "The grind is paying off 💪",
  "Unstoppable. Keep going 🚀",
  "You're on another level now ⚡",
  "The Beast within is awakening 🔥",
];

// ── Confetti particle ─────────────────────────────────────────────────────────
function Particle({ delay, x, color }: { delay: number; x: number; color: string }) {
  return (
    <div
      className="absolute top-0 w-2 h-2 rounded-sm"
      style={{
        left: `${x}%`,
        background: color,
        animation: `confetti-fall 1.8s ${delay}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) both`,
        transform: `rotate(${Math.random() * 360}deg)`,
      }}
    />
  );
}

export default function LevelUpModal({ data, onClose }: LevelUpModalProps) {
  const [visible, setVisible] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number; color: string }>>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autoCloseRef = useRef<any>(undefined);

  const tierColor = TIER_COLORS[data?.newTier ?? "Rookie"] ?? TIER_COLORS.Rookie;
  const beastMsg = useRef(BEAST_MESSAGES[Math.floor(Math.random() * BEAST_MESSAGES.length)]).current;

  useEffect(() => {
    if (!data) {
      setVisible(false);
      return;
    }

    // Generate confetti particles
    const colors = [
      "oklch(0.60 0.22 240)",
      "oklch(0.72 0.18 200)",
      tierColor,
      "oklch(0.80 0.2 85)",
      "oklch(0.75 0.2 55)",
      "#ffffff",
    ];
    setParticles(
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 600,
        color: colors[Math.floor(Math.random() * colors.length)],
      }))
    );

    const t = setTimeout(() => setVisible(true), 50);
    autoCloseRef.current = setTimeout(() => handleClose(), 5000);
    return () => {
      clearTimeout(t);
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    };
  }, [data]);

  const handleClose = () => {
    setVisible(false);
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    setTimeout(onClose, 350);
  };

  if (!data) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      style={{
        background: visible ? "oklch(0 0 0 / 0.75)" : "oklch(0 0 0 / 0)",
        backdropFilter: visible ? "blur(12px)" : "blur(0px)",
        transition: "background 0.35s ease, backdrop-filter 0.35s ease",
      }}
      onClick={handleClose}
    >
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {visible && particles.map((p) => (
          <Particle key={p.id} x={p.x} delay={p.delay} color={p.color} />
        ))}
      </div>

      {/* Modal card */}
      <div
        className={cn(
          "relative w-full max-w-[340px] rounded-3xl overflow-hidden text-center",
          "border border-white/10"
        )}
        style={{
          background: "oklch(0.10 0.015 240)",
          boxShadow: `0 0 60px ${tierColor}40, 0 24px 80px oklch(0 0 0 / 0.6)`,
          transform: visible ? "scale(1) translateY(0)" : "scale(0.85) translateY(30px)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient top strip */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: `linear-gradient(90deg, ${tierColor}, oklch(0.60 0.22 240))` }}
        />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X size={14} className="text-white/70" />
        </button>

        <div className="px-8 pt-10 pb-8">
          {/* Icon */}
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 beast-reveal"
            style={{
              background: `linear-gradient(135deg, ${tierColor}40, ${tierColor}20)`,
              boxShadow: `0 0 30px ${tierColor}50`,
              border: `1px solid ${tierColor}40`,
            }}
          >
            <Zap size={36} style={{ color: tierColor }} fill="currentColor" />
          </div>

          {/* Level up text */}
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-2">
            Level Up!
          </p>
          <h2
            className="text-5xl font-display font-extrabold mb-1 beast-reveal"
            style={{ color: tierColor, animationDelay: "0.1s" }}
          >
            Level {data.newLevel}
          </h2>

          {/* Tier change */}
          {data.tierChanged && data.newTier && (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mt-3 mb-4 beast-reveal"
              style={{
                background: `${tierColor}20`,
                border: `1px solid ${tierColor}40`,
                animationDelay: "0.2s",
              }}
            >
              <span className="text-xs font-bold" style={{ color: tierColor }}>
                🏆 {data.oldTier} → {data.newTier}
              </span>
            </div>
          )}

          {/* Beast message */}
          <p
            className="text-base font-semibold text-foreground mt-4 mb-2 beast-reveal"
            style={{ animationDelay: "0.25s" }}
          >
            {beastMsg}
          </p>

          {data.xpEarned && (
            <p
              className="text-sm text-muted-foreground beast-reveal"
              style={{ animationDelay: "0.3s" }}
            >
              +{data.xpEarned} XP earned
            </p>
          )}

          {/* CTA */}
          <button
            onClick={handleClose}
            className="w-full mt-6 h-12 rounded-2xl font-bold text-sm text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] beast-reveal"
            style={{
              background: `linear-gradient(135deg, ${tierColor}, oklch(0.60 0.22 240))`,
              boxShadow: `0 8px 24px ${tierColor}40`,
              animationDelay: "0.35s",
            }}
          >
            Keep Going 🔥
          </button>
        </div>
      </div>
    </div>
  );
}
