import { useState } from "react";
import { useLocation } from "wouter";
import {
  LayoutDashboard,
  Dumbbell,
  Salad,
  TrendingUp,
  CheckSquare,
  User,
  BookOpen,
  Trophy,
  Users,
  MoreHorizontal,
  X,
  Gift,
  BarChart2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { path: "/workout",   icon: Dumbbell,         label: "Train" },
  { path: "/nutrition", icon: Salad,             label: "Fuel" },
  { path: "/progress",  icon: TrendingUp,        label: "Progress" },
  { path: "/profile",   icon: User,              label: "Profile" },
];

const MORE_ITEMS = [
  { path: "/habits",       icon: CheckSquare, label: "Habits",       color: "oklch(0.72 0.2 145)" },
  { path: "/library",      icon: BookOpen,    label: "Library",      color: "oklch(0.65 0.2 240)" },
  { path: "/performance",  icon: BarChart2,   label: "Performance",  color: "oklch(0.72 0.22 340)" },
  { path: "/tiers",        icon: Trophy,      label: "Tiers",        color: "oklch(0.80 0.2 85)" },
  { path: "/gamification", icon: Sparkles,    label: "Achievements", color: "oklch(0.67 0.24 290)" },
  { path: "/referral",     icon: Gift,        label: "Referrals",    color: "oklch(0.75 0.2 55)" },
  { path: "/social",       icon: Users,       label: "Community",    color: "oklch(0.72 0.18 200)" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [showMore, setShowMore] = useState(false);

  const isMoreActive = MORE_ITEMS.some(
    (item) => location === item.path || location.startsWith(item.path + "/")
  );

  return (
    <div className="app-container flex flex-col bg-background">
      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-nav scrollbar-hide">
        {children}
      </main>

      {/* More drawer */}
      {showMore && (
        <div className="fixed inset-0 z-40 flex items-end max-w-[430px] mx-auto left-0 right-0">
          <div
            className="absolute inset-0 bg-background/70 backdrop-blur-md"
            onClick={() => setShowMore(false)}
          />
          <div className="relative w-full rounded-t-[2rem] overflow-hidden animate-slide-up">
            {/* Gradient header */}
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{ background: "var(--grad-primary)" }}
            />
            <div className="relative glass-strong border-t border-white/10 p-5 pb-28">
              {/* Handle bar */}
              <div className="w-10 h-1 rounded-full bg-border mx-auto mb-4" />
              <div className="flex items-center justify-between mb-5">
                <span className="font-display font-bold text-lg gradient-text">Explore</span>
                <button
                  onClick={() => setShowMore(false)}
                  className="w-8 h-8 rounded-xl bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {MORE_ITEMS.map(({ path, icon: Icon, label, color }) => {
                  const isActive = location === path;
                  return (
                    <button
                      key={path}
                      onClick={() => { navigate(path); setShowMore(false); }}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 relative overflow-hidden",
                        isActive
                          ? "bg-primary/15 border border-primary/40"
                          : "bg-muted/60 border border-border/40 hover:bg-muted"
                      )}
                    >
                      {isActive && (
                        <div
                          className="absolute inset-0 opacity-10 rounded-2xl"
                          style={{ background: `radial-gradient(circle at center, ${color}, transparent 70%)` }}
                        />
                      )}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center relative"
                        style={{
                          background: isActive
                            ? `linear-gradient(135deg, ${color}33, ${color}15)`
                            : "var(--muted)",
                          boxShadow: isActive ? `0 0 12px ${color}40` : "none",
                        }}
                      >
                        <Icon size={18} style={{ color: isActive ? color : "var(--muted-foreground)" }} />
                      </div>
                      <span
                        className="text-[10px] font-semibold text-center leading-tight"
                        style={{ color: isActive ? color : "var(--muted-foreground)" }}
                      >
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 safe-bottom">
        <div className="mx-3 mb-3">
          {/* Artistic nav container */}
          <div
            className="rounded-[1.5rem] border overflow-hidden"
            style={{
              background: "color-mix(in oklch, var(--card) 85%, transparent)",
              backdropFilter: "blur(32px) saturate(1.6)",
              WebkitBackdropFilter: "blur(32px) saturate(1.6)",
              borderColor: "color-mix(in oklch, var(--border) 60%, transparent)",
              boxShadow: "0 -4px 32px oklch(0 0 0 / 0.3), 0 4px 16px oklch(0 0 0 / 0.2)",
            }}
          >
            {/* Subtle gradient top line */}
            <div
              className="h-px w-full"
              style={{ background: "var(--grad-primary)", opacity: 0.4 }}
            />
            <div className="flex items-center justify-around px-1 py-2">
              {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
                const isActive = location === path || location.startsWith(path + "/");
                return (
                  <button
                    key={path}
                    onClick={() => { navigate(path); setShowMore(false); }}
                    className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-2xl transition-all duration-300 min-w-0 relative"
                  >
                    {isActive && (
                      <div
                        className="absolute inset-0 rounded-2xl opacity-15"
                        style={{ background: "var(--grad-primary)" }}
                      />
                    )}
                    <div
                      className={cn(
                        "relative p-1.5 rounded-xl transition-all duration-300",
                        isActive ? "scale-110" : "scale-100"
                      )}
                    >
                      {isActive && (
                        <div
                          className="absolute inset-0 rounded-xl blur-sm opacity-60"
                          style={{ background: "var(--grad-primary)" }}
                        />
                      )}
                      <Icon
                        size={20}
                        className="relative z-10 transition-all duration-300"
                        style={{
                          color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                          filter: isActive ? "drop-shadow(0 0 6px var(--vyro-glow))" : "none",
                        }}
                        strokeWidth={isActive ? 2.5 : 1.8}
                      />
                    </div>
                    <span
                      className="text-[10px] font-semibold transition-all duration-300 relative z-10"
                      style={{
                        color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                        opacity: isActive ? 1 : 0.6,
                      }}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}

              {/* More button */}
              <button
                onClick={() => setShowMore(!showMore)}
                className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-2xl transition-all duration-300 min-w-0 relative"
              >
                {(showMore || isMoreActive) && (
                  <div
                    className="absolute inset-0 rounded-2xl opacity-15"
                    style={{ background: "var(--grad-primary)" }}
                  />
                )}
                <div
                  className={cn(
                    "relative p-1.5 rounded-xl transition-all duration-300",
                    (showMore || isMoreActive) ? "scale-110" : "scale-100"
                  )}
                >
                  <MoreHorizontal
                    size={20}
                    className="relative z-10 transition-all duration-300"
                    style={{
                      color: (showMore || isMoreActive) ? "var(--primary)" : "var(--muted-foreground)",
                      filter: (showMore || isMoreActive) ? "drop-shadow(0 0 6px var(--vyro-glow))" : "none",
                    }}
                    strokeWidth={(showMore || isMoreActive) ? 2.5 : 1.8}
                  />
                </div>
                <span
                  className="text-[10px] font-semibold transition-all duration-300 relative z-10"
                  style={{
                    color: (showMore || isMoreActive) ? "var(--primary)" : "var(--muted-foreground)",
                    opacity: (showMore || isMoreActive) ? 1 : 0.6,
                  }}
                >
                  More
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
