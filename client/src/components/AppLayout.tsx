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
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { path: "/workout", icon: Dumbbell, label: "Workout" },
  { path: "/nutrition", icon: Salad, label: "Nutrition" },
  { path: "/progress", icon: TrendingUp, label: "Progress" },
  { path: "/profile", icon: User, label: "Profile" },
];

const MORE_ITEMS = [
  { path: "/habits", icon: CheckSquare, label: "Habits" },
  { path: "/library", icon: BookOpen, label: "Library" },
  { path: "/tiers", icon: Trophy, label: "Tiers" },
  { path: "/gamification", icon: Trophy, label: "Achievements" },
  { path: "/referral", icon: Gift, label: "Referrals" },
  { path: "/social", icon: Users, label: "Community" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [showMore, setShowMore] = useState(false);

  const isMoreActive = MORE_ITEMS.some((item) => location === item.path || location.startsWith(item.path + "/"));

  return (
    <div className="app-container flex flex-col bg-background">
      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-nav scrollbar-hide">
        {children}
      </main>

      {/* More drawer */}
      {showMore && (
        <div className="fixed inset-0 z-40 flex items-end max-w-[430px] mx-auto left-0 right-0">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setShowMore(false)} />
          <div className="relative w-full bg-card border-t border-border rounded-t-3xl p-5 pb-24 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-foreground">More</span>
              <button onClick={() => setShowMore(false)} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {MORE_ITEMS.map(({ path, icon: Icon, label }) => {
                const isActive = location === path;
                return (
                  <button key={path} onClick={() => { navigate(path); setShowMore(false); }}
                    className={cn("flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
                      isActive ? "border-primary bg-primary/10" : "border-border bg-muted")}>
                    <Icon size={22} className={isActive ? "text-primary" : "text-muted-foreground"} />
                    <span className="text-[10px] font-medium text-center leading-tight" style={{ color: isActive ? "var(--primary)" : "var(--muted-foreground)" }}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 safe-bottom">
        <div className="mx-3 mb-3 rounded-2xl bg-card/90 backdrop-blur-xl border border-border/50 shadow-2xl">
          <div className="flex items-center justify-around px-2 py-2">
            {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
              const isActive = location === path || location.startsWith(path + "/");
              return (
                <button
                  key={path}
                  onClick={() => { navigate(path); setShowMore(false); }}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-0",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className={cn("p-1.5 rounded-xl transition-all duration-200", isActive && "bg-primary/15 glow-sm")}>
                    <Icon size={20} className={cn("transition-all duration-200", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 1.8} />
                  </div>
                  <span className={cn("text-[10px] font-medium transition-all duration-200", isActive ? "opacity-100" : "opacity-60")}>
                    {label}
                  </span>
                </button>
              );
            })}
            {/* More button */}
            <button
              onClick={() => setShowMore(!showMore)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-0",
                (showMore || isMoreActive) ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn("p-1.5 rounded-xl transition-all duration-200", (showMore || isMoreActive) && "bg-primary/15 glow-sm")}>
                <MoreHorizontal size={20} strokeWidth={(showMore || isMoreActive) ? 2.5 : 1.8} />
              </div>
              <span className={cn("text-[10px] font-medium", (showMore || isMoreActive) ? "opacity-100" : "opacity-60")}>More</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
