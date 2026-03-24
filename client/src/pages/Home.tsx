import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
  Zap, ChevronRight, Dumbbell, Apple, TrendingUp, Trophy,
  Flame, Target, BarChart2, CheckSquare, Shield, Sparkles,
} from "lucide-react";

/* ─── Tier helpers ─────────────────────────────────────────────────────── */
const TIER_LABELS: Record<string, string> = {
  rookie: "Rookie",
  prospect: "Prospect",
  athlete: "Athlete",
  beast: "Beast",
  elite: "Elite",
  legend: "Legend",
};

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // SEO
  useEffect(() => {
    document.title = "VYRO — All-in-One Fitness Tracker App";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Stop using 5 fitness apps. Track workouts, nutrition, habits, and progress in one place with VYRO. AI-powered fitness tracking with gamification.");
    const metaKw = document.querySelector('meta[name="keywords"]');
    if (metaKw) metaKw.setAttribute("content", "fitness app, workout tracker, nutrition tracking, habit builder, gamification, exercise routine, strength training, fitness goals");
  }, []);

  const { data: profile } = trpc.profile.get.useQuery(undefined, { enabled: isAuthenticated });
  const { data: engagement } = trpc.engagement.getXP.useQuery(undefined, { enabled: isAuthenticated });
  const { data: dailyGoals } = trpc.engagement.getTodayGoals.useQuery(undefined, { enabled: isAuthenticated });
  const { data: gameStats } = trpc.gamification.getStats.useQuery(undefined, { enabled: isAuthenticated });

  useEffect(() => {
    if (!loading && isAuthenticated && profile !== undefined) {
      navigate(profile?.onboardingCompleted ? "/dashboard" : "/onboarding");
    }
  }, [loading, isAuthenticated, profile, navigate]);

  /* ─── Loading ──────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center animate-pulse">
            <Zap className="text-primary" size={24} />
          </div>
          <p className="text-muted-foreground text-sm tracking-wide">Loading VYRO...</p>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════
     LANDING PAGE — unauthenticated visitors
     ═══════════════════════════════════════════════════════════════════════ */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col overflow-hidden">
        {/* Background glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/6 blur-[160px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-primary/4 blur-[120px]" />
        </div>

        <div className="relative flex flex-col min-h-screen max-w-[480px] mx-auto w-full px-6">

          {/* ── Nav ── */}
          <header className="flex items-center justify-between pt-safe pt-10 pb-6 animate-slide-up">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_oklch(0.60_0.22_240/0.3)]">
                <Zap size={18} className="text-white" fill="currentColor" />
              </div>
              <span className="text-xl font-display font-bold text-foreground tracking-tight">VYRO</span>
            </div>
            <a href={getLoginUrl()}>
              <Button variant="outline" size="sm" className="rounded-xl border-border/60 text-sm font-medium px-5 h-9">
                Sign in
              </Button>
            </a>
          </header>

          {/* ── Hero ── */}
          <main className="flex-1 flex flex-col justify-center pb-8">

            {/* Badge */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-8 self-start animate-slide-up"
              style={{ animationDelay: "0.05s" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              All-in-one fitness platform
            </div>

            {/* Headline */}
            <h1
              className="text-[2.75rem] sm:text-5xl font-display font-extrabold leading-[1.08] tracking-tight text-foreground mb-5 animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              Stop using<br />
              5 fitness apps.<br />
              <span className="text-primary">Use VYRO.</span>
            </h1>

            {/* Subtext */}
            <h2
              className="text-base text-muted-foreground leading-relaxed mb-10 max-w-[340px] animate-slide-up"
              style={{ animationDelay: "0.15s" }}
            >
              Track workouts, nutrition, habits, and progress — all in one place. Level up your fitness journey.
            </h2>

            {/* Feature grid */}
            <div
              className="grid grid-cols-2 gap-2.5 mb-10 animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              {[
                { icon: Dumbbell, label: "Workout Tracking", desc: "Log sets, reps & weight" },
                { icon: Apple, label: "Nutrition", desc: "Calories & macros" },
                { icon: BarChart2, label: "Progress", desc: "Charts & analytics" },
                { icon: Trophy, label: "Gamification", desc: "XP, tiers & badges" },
              ].map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-card/60 border border-border/40 backdrop-blur-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={14} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground leading-tight">{label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.25s" }}>
              <a href={getLoginUrl()} className="block">
                <Button
                  size="lg"
                  className="w-full h-14 text-base font-bold rounded-2xl shadow-[0_0_30px_oklch(0.60_0.22_240/0.4)] hover:shadow-[0_0_40px_oklch(0.60_0.22_240/0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Get Started Free
                  <ChevronRight size={18} className="ml-1.5" />
                </Button>
              </a>
              <p className="text-center text-xs text-muted-foreground">
                Free to start · No credit card required
              </p>
            </div>
          </main>

          {/* ── Additional features strip ── */}
          <div
            className="py-6 border-t border-border/30 animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-center justify-center gap-6 text-muted-foreground">
              {[
                { icon: Shield, label: "Secure" },
                { icon: Sparkles, label: "AI-Powered" },
                { icon: CheckSquare, label: "Habit Builder" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs">
                  <Icon size={12} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Social proof ── */}
          <footer
            className="pb-10 border-t border-border/30 pt-6 animate-slide-up"
            style={{ animationDelay: "0.35s" }}
          >
            <div className="flex justify-around">
              {[
                { value: "50K+", label: "Athletes" },
                { value: "4.9", label: "Rating", suffix: "★" },
                { value: "10+", label: "Features" },
              ].map(({ value, label, suffix }) => (
                <div key={label} className="text-center">
                  <p className="text-lg font-display font-bold text-foreground">
                    {value}{suffix && <span className="text-primary ml-0.5">{suffix}</span>}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </footer>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════
     TODAY DASHBOARD — authenticated users
     ═══════════════════════════════════════════════════════════════════════ */
  const xpProgress = (engagement?.totalXP || 0) % 500;
  const xpNeeded = 500;
  const xpPercent = Math.min((xpProgress / xpNeeded) * 100, 100);
  const currentStreak = gameStats?.workoutStreak || 0;
  const goalsCompleted = [
    dailyGoals?.workoutCompleted,
    dailyGoals?.mealsLogged,
    dailyGoals?.activityCompleted,
  ].filter(Boolean).length || 0;
  const totalGoals = 3;
  const tierLabel = TIER_LABELS[engagement?.currentTier || "rookie"] || "Rookie";

  return (
    <div className="min-h-screen bg-background pb-nav">
      {/* Content */}
      <div className="px-5 pt-6 space-y-5">

        {/* Greeting + Tier */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
              {new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 17 ? "Good Afternoon" : "Good Evening"}
            </p>
            <h1 className="text-2xl font-display font-bold text-foreground mt-0.5">
              {user?.name?.split(" ")[0] || "Athlete"}
            </h1>
          </div>
          <button
            onClick={() => navigate("/tiers")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border/40 hover:border-primary/40 transition-colors press-scale"
          >
            <Trophy size={14} className="text-primary" />
            <span className="text-xs font-bold text-foreground">{tierLabel}</span>
            <span className="text-[10px] text-muted-foreground">Lv.{engagement?.currentLevel || 1}</span>
          </button>
        </div>

        {/* XP Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Level {engagement?.currentLevel || 1}</span>
            <span className="text-xs text-muted-foreground">{xpProgress} / {xpNeeded} XP</span>
          </div>
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>

        {/* Start Workout CTA */}
        <button
          onClick={() => navigate("/workout")}
          className="w-full p-5 rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-between group hover:shadow-[0_0_30px_oklch(0.60_0.22_240/0.4)] transition-all duration-300 active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Dumbbell size={22} />
            </div>
            <div className="text-left">
              <p className="text-xs font-medium opacity-80">Ready to train?</p>
              <p className="text-lg font-bold">Start Workout</p>
            </div>
          </div>
          <ChevronRight size={20} className="opacity-60 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-card border border-border/40 text-center">
            <Flame size={16} className="text-orange-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{currentStreak}</p>
            <p className="text-[10px] text-muted-foreground">Day Streak</p>
          </div>
          <div className="p-3.5 rounded-xl bg-card border border-border/40 text-center">
            <Target size={16} className="text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{goalsCompleted}/{totalGoals}</p>
            <p className="text-[10px] text-muted-foreground">Goals Done</p>
          </div>
          <div className="p-3.5 rounded-xl bg-card border border-border/40 text-center">
            <Zap size={16} className="text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{engagement?.totalXP || 0}</p>
            <p className="text-[10px] text-muted-foreground">Total XP</p>
          </div>
        </div>

        {/* Today's Goals */}
        {dailyGoals && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Today's Goals</h3>
            <div className="space-y-2">
              {[
                { goal: "Complete Workout", completed: dailyGoals.workoutCompleted, icon: Dumbbell, color: "text-primary" },
                { goal: "Log Meals", completed: dailyGoals.mealsLogged, icon: Apple, color: "text-green-500" },
                { goal: "Stay Active", completed: dailyGoals.activityCompleted, icon: TrendingUp, color: "text-orange-500" },
              ].map(({ goal, completed, icon: Icon, color }) => (
                <div
                  key={goal}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border/40 transition-all duration-200"
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    completed ? "bg-primary border-primary" : "border-border/60"
                  }`}>
                    {completed && <span className="text-white text-[10px] font-bold">✓</span>}
                  </div>
                  <Icon size={14} className={color} />
                  <p className={`text-sm font-medium flex-1 ${completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {goal}
                  </p>
                  {completed && <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Done</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 pb-4">
          <button
            onClick={() => navigate("/nutrition")}
            className="p-4 rounded-xl bg-card border border-border/40 flex flex-col items-center gap-2 hover:border-primary/40 transition-all duration-200 active:scale-95"
          >
            <Apple size={20} className="text-green-500" />
            <span className="text-xs font-semibold text-foreground">Log Food</span>
          </button>
          <button
            onClick={() => navigate("/habits")}
            className="p-4 rounded-xl bg-card border border-border/40 flex flex-col items-center gap-2 hover:border-primary/40 transition-all duration-200 active:scale-95"
          >
            <CheckSquare size={20} className="text-primary" />
            <span className="text-xs font-semibold text-foreground">Habits</span>
          </button>
        </div>
      </div>
    </div>
  );
}
