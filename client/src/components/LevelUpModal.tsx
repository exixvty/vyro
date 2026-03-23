import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Zap, Star, ChevronRight } from "lucide-react";

/* ─── Tier config (mirrors TierBadge) ──────────────────────────────────────── */
const TIER_CONFIG: Record<string, {
  icon: string;
  gradient: string;
  glow: string;
  label: string;
  tagline: string;
}> = {
  Rookie:   { icon: "🥉", gradient: "from-slate-400 via-slate-500 to-slate-600",   glow: "oklch(0.60 0.05 270 / 0.6)",  label: "Rookie",   tagline: "The journey begins." },
  Prospect: { icon: "🥈", gradient: "from-blue-400 via-blue-500 to-blue-600",       glow: "oklch(0.65 0.2 240 / 0.6)",   label: "Prospect", tagline: "You're building momentum." },
  Athlete:  { icon: "🥇", gradient: "from-amber-400 via-amber-500 to-amber-600",    glow: "oklch(0.75 0.18 85 / 0.6)",   label: "Athlete",  tagline: "Discipline is your superpower." },
  Beast:    { icon: "🔥", gradient: "from-orange-400 via-red-500 to-red-600",       glow: "oklch(0.65 0.22 25 / 0.6)",   label: "Beast",    tagline: "Unstoppable. Relentless." },
  Elite:    { icon: "⚡", gradient: "from-purple-400 via-purple-500 to-purple-600", glow: "oklch(0.67 0.24 290 / 0.6)",  label: "Elite",    tagline: "Few reach this height." },
  Legend:   { icon: "👑", gradient: "from-yellow-300 via-yellow-400 to-yellow-500", glow: "oklch(0.80 0.2 85 / 0.6)",    label: "Legend",   tagline: "You are the standard." },
};

/* ─── Confetti particle ─────────────────────────────────────────────────────── */
const CONFETTI_COLORS = [
  "oklch(0.67 0.24 290)", // violet
  "oklch(0.72 0.22 340)", // pink
  "oklch(0.72 0.18 200)", // cyan
  "oklch(0.72 0.2 145)",  // green
  "oklch(0.80 0.2 85)",   // gold
  "oklch(0.75 0.2 55)",   // orange
  "oklch(0.65 0.2 240)",  // blue
];

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  shape: "circle" | "rect" | "triangle";
  opacity: number;
  life: number;
}

function useConfetti(active: boolean, count = 120) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    // Spawn particles from center-top
    particlesRef.current = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 35 + Math.random() * 30, // cluster around center
      y: 10 + Math.random() * 20,
      vx: (Math.random() - 0.5) * 6,
      vy: -4 - Math.random() * 6,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 6 + Math.random() * 10,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      shape: (["circle", "rect", "triangle"] as const)[Math.floor(Math.random() * 3)],
      opacity: 1,
      life: 1,
    }));

    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 16, 3);
      lastTime = now;

      particlesRef.current = particlesRef.current
        .map((p) => ({
          ...p,
          x: p.x + p.vx * dt * 0.5,
          y: p.y + p.vy * dt * 0.5,
          vy: p.vy + 0.25 * dt, // gravity
          vx: p.vx * 0.99,      // air resistance
          rotation: p.rotation + p.rotationSpeed * dt,
          life: p.life - 0.008 * dt,
          opacity: Math.max(0, p.life),
        }))
        .filter((p) => p.life > 0 && p.y < 110);

      setParticles([...particlesRef.current]);

      if (particlesRef.current.length > 0) {
        animRef.current = requestAnimationFrame(tick);
      }
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [active, count]);

  return particles;
}

/* ─── Orbiting star ─────────────────────────────────────────────────────────── */
function OrbitingStar({ angle, radius, size, delay }: { angle: number; radius: number; size: number; delay: number }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top: "50%",
        left: "50%",
        width: size,
        height: size,
        marginTop: -size / 2,
        marginLeft: -size / 2,
        animation: `orbit-star ${2.5 + delay * 0.5}s linear infinite`,
        animationDelay: `${delay}s`,
        transformOrigin: `${-radius}px 0`,
        transform: `rotate(${angle}deg) translateX(${radius}px)`,
      }}
    >
      <Star size={size} fill="currentColor" className="text-yellow-300 opacity-80" />
    </div>
  );
}

/* ─── Main modal ────────────────────────────────────────────────────────────── */
export interface LevelUpData {
  newLevel: number;
  oldLevel: number;
  newTier: string;
  oldTier: string;
  tierChanged: boolean;
  xpGained: number;
  totalXP: number;
}

interface LevelUpModalProps {
  data: LevelUpData | null;
  onClose: () => void;
}

export default function LevelUpModal({ data, onClose }: LevelUpModalProps) {
  const [phase, setPhase] = useState<"hidden" | "flash" | "badge" | "details" | "done">("hidden");
  const [confettiActive, setConfettiActive] = useState(false);
  const particles = useConfetti(confettiActive, 150);

  const tierCfg = data ? (TIER_CONFIG[data.newTier] ?? TIER_CONFIG.Rookie) : TIER_CONFIG.Rookie;
  const isTierUp = data?.tierChanged ?? false;

  useEffect(() => {
    if (!data) {
      setPhase("hidden");
      setConfettiActive(false);
      return;
    }

    // Orchestrate the reveal sequence
    setPhase("flash");
    const t1 = setTimeout(() => { setPhase("badge"); setConfettiActive(true); }, 120);
    const t2 = setTimeout(() => setPhase("details"), 700);
    const t3 = setTimeout(() => setPhase("done"), 900);
    // Auto-close after 6s if user doesn't tap
    const t4 = setTimeout(() => onClose(), 6500);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [data]);

  if (!data || phase === "hidden") return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      onClick={onClose}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* ── Backdrop flash ── */}
      <div
        className="absolute inset-0"
        style={{
          background: phase === "flash"
            ? `radial-gradient(circle at center, ${tierCfg.glow}, oklch(0 0 0 / 0.95))`
            : "oklch(0 0 0 / 0.88)",
          backdropFilter: "blur(12px)",
          transition: "background 0.5s ease",
        }}
      />

      {/* ── Full-screen confetti canvas ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.shape === "rect" ? p.size * 0.5 : p.size,
              background: p.color,
              borderRadius: p.shape === "circle" ? "50%" : p.shape === "rect" ? "2px" : "0",
              clipPath: p.shape === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)" : undefined,
              transform: `rotate(${p.rotation}deg)`,
              opacity: p.opacity,
            }}
          />
        ))}
      </div>

      {/* ── Modal card ── */}
      <div
        className="relative z-10 flex flex-col items-center px-8 py-10 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: phase === "flash" ? "scale(0.6)" : phase === "badge" ? "scale(1.05)" : "scale(1)",
          opacity: phase === "flash" ? 0 : 1,
          transition: phase === "badge"
            ? "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease"
            : "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
        }}
      >
        {/* ── Level-up label ── */}
        <div
          className="mb-4 px-4 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase"
          style={{
            background: `linear-gradient(135deg, ${tierCfg.glow}, transparent)`,
            borderColor: tierCfg.glow,
            color: "white",
            opacity: phase === "done" ? 1 : 0,
            transform: phase === "done" ? "translateY(0)" : "translateY(-8px)",
            transition: "opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s",
          }}
        >
          {isTierUp ? "🎉 Tier Up!" : "⚡ Level Up!"}
        </div>

        {/* ── Tier badge with orbiting stars ── */}
        <div className="relative mb-6">
          {/* Glow ring */}
          <div
            className="absolute inset-0 rounded-full blur-2xl"
            style={{
              background: tierCfg.glow,
              transform: "scale(1.8)",
              animation: phase === "badge" || phase === "details" || phase === "done"
                ? "tier-glow-pulse 2s ease-in-out infinite"
                : "none",
            }}
          />

          {/* Orbiting stars */}
          {(phase === "details" || phase === "done") && (
            <>
              <OrbitingStar angle={0}   radius={72} size={14} delay={0} />
              <OrbitingStar angle={120} radius={72} size={10} delay={0.3} />
              <OrbitingStar angle={240} radius={72} size={12} delay={0.6} />
              <OrbitingStar angle={60}  radius={88} size={8}  delay={0.9} />
              <OrbitingStar angle={180} radius={88} size={11} delay={1.2} />
            </>
          )}

          {/* Badge circle */}
          <div
            className={cn(
              "relative w-36 h-36 rounded-full flex items-center justify-center border-4 overflow-hidden",
              "shadow-2xl"
            )}
            style={{
              background: `linear-gradient(135deg, ${tierCfg.glow}, oklch(0.1 0.02 270))`,
              borderColor: tierCfg.glow,
            }}
          >
            {/* Gradient overlay */}
            <div
              className={cn("absolute inset-0 bg-gradient-to-br opacity-40", tierCfg.gradient)}
            />
            {/* Shine sweep */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, transparent 30%, white 50%, transparent 70%)",
                opacity: 0.15,
                animation: "shine-sweep 3s ease-in-out infinite",
              }}
            />
            {/* Icon */}
            <span
              className="relative z-10 text-7xl"
              style={{
                filter: `drop-shadow(0 0 20px ${tierCfg.glow})`,
                animation: phase === "badge" ? "badge-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both" : "none",
              }}
            >
              {tierCfg.icon}
            </span>
          </div>
        </div>

        {/* ── Tier / level text ── */}
        <div
          className="text-center mb-2"
          style={{
            opacity: phase === "details" || phase === "done" ? 1 : 0,
            transform: phase === "details" || phase === "done" ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.4s ease 0.15s, transform 0.4s ease 0.15s",
          }}
        >
          {isTierUp ? (
            <>
              <p className="text-sm text-white/60 mb-1 font-medium tracking-wide">NEW TIER UNLOCKED</p>
              <h2
                className="text-5xl font-display font-black mb-1"
                style={{
                  background: `linear-gradient(135deg, white, ${tierCfg.glow})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {tierCfg.label}
              </h2>
              <p className="text-white/50 text-sm italic">{tierCfg.tagline}</p>
            </>
          ) : (
            <>
              <p className="text-sm text-white/60 mb-1 font-medium tracking-wide">LEVEL REACHED</p>
              <h2
                className="text-7xl font-display font-black leading-none"
                style={{
                  background: `linear-gradient(135deg, white, ${tierCfg.glow})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {data.newLevel}
              </h2>
              <p className="text-white/50 text-sm mt-1">{tierCfg.label} Tier</p>
            </>
          )}
        </div>

        {/* ── XP stats row ── */}
        <div
          className="flex items-center gap-4 mb-8"
          style={{
            opacity: phase === "done" ? 1 : 0,
            transform: phase === "done" ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.4s ease 0.3s, transform 0.4s ease 0.3s",
          }}
        >
          <div className="text-center px-4 py-2 rounded-2xl bg-white/10 border border-white/20">
            <p className="text-xs text-white/50 mb-0.5">XP Gained</p>
            <p className="font-display font-bold text-lg text-white">+{data.xpGained}</p>
          </div>
          <div className="text-center px-4 py-2 rounded-2xl bg-white/10 border border-white/20">
            <p className="text-xs text-white/50 mb-0.5">Total XP</p>
            <p className="font-display font-bold text-lg text-white">{data.totalXP.toLocaleString()}</p>
          </div>
        </div>

        {/* ── CTA button ── */}
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm text-white"
          style={{
            background: `linear-gradient(135deg, ${tierCfg.glow}, oklch(0.67 0.24 290))`,
            boxShadow: `0 8px 32px ${tierCfg.glow}`,
            opacity: phase === "done" ? 1 : 0,
            transform: phase === "done" ? "translateY(0) scale(1)" : "translateY(8px) scale(0.9)",
            transition: "opacity 0.4s ease 0.45s, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.45s",
          }}
        >
          Keep Going
          <ChevronRight size={16} />
        </button>

        {/* ── Tap to dismiss hint ── */}
        <p
          className="mt-4 text-xs text-white/30"
          style={{
            opacity: phase === "done" ? 1 : 0,
            transition: "opacity 0.4s ease 0.7s",
          }}
        >
          Tap anywhere to continue
        </p>
      </div>
    </div>
  );
}
