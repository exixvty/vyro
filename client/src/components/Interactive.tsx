import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   AnimatedButton — press-scale + ripple + optional glow pulse
───────────────────────────────────────────────────────────── */
interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export function AnimatedButton({
  variant = "primary",
  size = "md",
  glow = false,
  loading = false,
  className,
  onClick,
  children,
  disabled,
  ...props
}: AnimatedButtonProps) {
  const [pressed, setPressed] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const btnRef = useRef<HTMLButtonElement>(null);
  const rippleId = useRef(0);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;
      const rect = btnRef.current?.getBoundingClientRect();
      if (rect) {
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        const id = ++rippleId.current;
        setRipples((r) => [...r, { id, x, y }]);
        setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 600);
      }
      onClick?.(e);
    },
    [disabled, loading, onClick]
  );

  const variantClasses = {
    primary: "bg-grad-primary text-white font-semibold shadow-lg",
    secondary: "bg-secondary text-secondary-foreground font-medium",
    ghost: "bg-transparent text-foreground hover:bg-secondary",
    danger: "bg-destructive text-destructive-foreground font-semibold",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm rounded-xl",
    md: "px-5 py-3 text-base rounded-2xl",
    lg: "px-7 py-4 text-lg rounded-2xl",
  };

  return (
    <button
      ref={btnRef}
      {...props}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      className={cn(
        "relative overflow-hidden select-none cursor-pointer transition-all duration-150",
        "flex items-center justify-center gap-2",
        variantClasses[variant],
        sizeClasses[size],
        pressed && !disabled && "scale-[0.94]",
        glow && "cta-pulse",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      style={{
        transform: pressed && !disabled ? "scale(0.94)" : undefined,
        transition: "transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.12s ease",
      }}
    >
      {/* Ripple particles */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute rounded-full bg-white/20 pointer-events-none"
          style={{
            left: `${r.x}%`,
            top: `${r.y}%`,
            width: "200%",
            paddingBottom: "200%",
            transform: "translate(-50%, -50%) scale(0)",
            animation: "ripple-expand 0.6s ease-out forwards",
          }}
        />
      ))}
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   PressCard — satisfying depth press with spring return
───────────────────────────────────────────────────────────── */
interface PressCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  disabled?: boolean;
  depth?: "sm" | "md" | "lg";
}

export function PressCard({ children, className, style, onClick, disabled, depth = "md" }: PressCardProps) {
  const [pressed, setPressed] = useState(false);

  const depthScale = { sm: 0.97, md: 0.95, lg: 0.92 };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={!disabled ? onClick : undefined}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => !disabled && setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onKeyDown={(e) => e.key === "Enter" && !disabled && onClick?.()}
      className={cn(
        "cursor-pointer select-none",
        "transition-all",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      style={{
        ...style,
        transform: pressed && !disabled ? `scale(${depthScale[depth]})` : "scale(1)",
        transition: pressed
          ? "transform 0.1s ease"
          : "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ConfettiEffect — burst of coloured particles on trigger
───────────────────────────────────────────────────────────── */
interface ConfettiProps {
  active: boolean;
  count?: number;
  className?: string;
}

const CONFETTI_COLORS = [
  "oklch(0.67 0.24 290)",
  "oklch(0.72 0.22 340)",
  "oklch(0.72 0.18 200)",
  "oklch(0.72 0.2 145)",
  "oklch(0.80 0.2 85)",
  "oklch(0.75 0.2 55)",
];

export function ConfettiEffect({ active, count = 24, className }: ConfettiProps) {
  const [particles, setParticles] = useState<
    { id: number; x: number; color: string; duration: number; delay: number; size: number; shape: string }[]
  >([]);

  useEffect(() => {
    if (!active) return;
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      duration: 0.7 + Math.random() * 0.6,
      delay: Math.random() * 0.3,
      size: 6 + Math.random() * 8,
      shape: Math.random() > 0.5 ? "rounded-full" : "rounded-sm",
    }));
    setParticles(newParticles);
    const t = setTimeout(() => setParticles([]), 1500);
    return () => clearTimeout(t);
  }, [active, count]);

  if (!particles.length) return null;

  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
      {particles.map((p) => (
        <div
          key={p.id}
          className={cn("absolute confetti-particle", p.shape)}
          style={{
            left: `${p.x}%`,
            top: "20%",
            width: p.size,
            height: p.size,
            background: p.color,
            "--duration": `${p.duration}s`,
            "--delay": `${p.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   XPGainToast — floating "+50 XP" that rises and fades
───────────────────────────────────────────────────────────── */
interface XPGainProps {
  amount: number;
  visible: boolean;
  className?: string;
}

export function XPGainToast({ amount, visible, className }: XPGainProps) {
  if (!visible) return null;
  return (
    <div
      className={cn(
        "absolute pointer-events-none z-50 font-display font-bold text-lg gradient-text animate-xp-pop",
        className
      )}
    >
      +{amount} XP ⚡
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   AnimatedCounter — counts up from 0 to target value
───────────────────────────────────────────────────────────── */
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1200,
  decimals = 0,
  suffix = "",
  prefix = "",
  className,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const [flash, setFlash] = useState(false);
  const prevValue = useRef(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (value === prevValue.current) return;
    const start = prevValue.current;
    const end = value;
    const startTime = performance.now();

    setFlash(true);
    setTimeout(() => setFlash(false), 400);

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (end - start) * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        prevValue.current = end;
      }
    };

    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [value, duration]);

  return (
    <span
      className={cn(
        "inline-block transition-colors duration-300",
        flash && "text-primary",
        className
      )}
    >
      {prefix}{display.toFixed(decimals)}{suffix}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   CheckmarkButton — satisfying set-complete toggle
───────────────────────────────────────────────────────────── */
interface CheckmarkButtonProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function CheckmarkButton({ checked, onChange, className }: CheckmarkButtonProps) {
  const [animating, setAnimating] = useState(false);

  const handleClick = () => {
    setAnimating(true);
    onChange(!checked);
    setTimeout(() => setAnimating(false), 500);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 select-none",
        "border-2",
        checked
          ? "bg-primary border-primary text-primary-foreground"
          : "border-border bg-transparent text-transparent",
        animating && "animate-check-pop",
        className
      )}
      style={{
        transform: animating ? undefined : checked ? "scale(1)" : "scale(1)",
        transition: "transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s ease, border-color 0.2s ease",
      }}
    >
      <svg
        viewBox="0 0 12 10"
        fill="none"
        className="w-3.5 h-3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="1,5 4.5,8.5 11,1" />
      </svg>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   ProgressRing — animated SVG ring for circular progress
───────────────────────────────────────────────────────────── */
interface ProgressRingProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
  className?: string;
}

export function ProgressRing({
  value,
  size = 80,
  strokeWidth = 6,
  color = "var(--primary)",
  trackColor = "var(--muted)",
  children,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SwipeToDelete — swipe left to reveal delete action
───────────────────────────────────────────────────────────── */
interface SwipeToDeleteProps {
  children: React.ReactNode;
  onDelete: () => void;
  className?: string;
}

export function SwipeToDelete({ children, onDelete, className }: SwipeToDeleteProps) {
  const [offset, setOffset] = useState(0);
  const startX = useRef(0);
  const isDragging = useRef(false);
  const threshold = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const delta = e.touches[0].clientX - startX.current;
    if (delta < 0) setOffset(Math.max(delta, -120));
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    if (offset < -threshold) {
      onDelete();
    }
    setOffset(0);
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Delete background */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-destructive px-4 rounded-r-2xl"
        style={{ width: Math.abs(Math.min(offset, 0)) }}
      >
        <span className="text-white text-sm font-semibold">Delete</span>
      </div>
      {/* Content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${offset}px)`,
          transition: isDragging.current ? "none" : "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PulseRing — animated ring around an element (for timers)
───────────────────────────────────────────────────────────── */
export function PulseRing({ children, active, className }: { children: React.ReactNode; active: boolean; className?: string }) {
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      {active && (
        <>
          <span className="absolute inset-0 rounded-full border-2 border-primary opacity-0 animate-ping" />
          <span className="absolute inset-[-4px] rounded-full border border-primary/30 animate-pulse" />
        </>
      )}
      {children}
    </div>
  );
}
