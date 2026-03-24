import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Zap, ChevronRight, Dumbbell, Apple, TrendingUp, Trophy, Flame, Target } from "lucide-react";
import { ProgressRing } from "@/components/Interactive";

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

  useEffect(() => {
    if (!loading && isAuthenticated && profile !== undefined) {
      navigate(profile?.onboardingCompleted ? "/dashboard" : "/onboarding");
    }
  }, [loading, isAuthenticated, profile, navigate]);

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

  // If not authenticated, show landing page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Subtle blue radial glow behind hero */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[140px]" />
        </div>

        <div className="relative flex flex-col min-h-screen max-w-[430px] mx-auto w-full px-6">

          {/* ── Nav ── */}
          <header className="flex items-center justify-between pt-12 pb-8 animate-slide-up">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Zap size={18} className="text-white" fill="currentColor" />
              </div>
              <span className="text-xl font-display font-bold text-foreground tracking-tight">VYRO</span>
            </div>
            <a href={getLoginUrl()}>
              <Button variant="outline" size="sm" className="rounded-xl border-border/60 text-sm font-medium px-4">
                Sign in
              </Button>
            </a>
          </header>

          {/* ── Hero ── */}
          <main className="flex-1 flex flex-col justify-center pb-12">

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-8 self-start animate-slide-up" style={{ animationDelay: "0.05s" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              All-in-one fitness platform
            </div>

            {/* Headline */}
            <h1 className="text-5xl font-display font-extrabold leading-[1.1] tracking-tight text-foreground mb-5 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Stop using<br />
              5 fitness apps.<br />
              <span className="text-primary">Use VYRO.</span>
            </h1>

            {/* Subtext */}
            <h2 className="text-base text-muted-foreground leading-relaxed mb-10 max-w-[320px] animate-slide-up" style={{ animationDelay: "0.15s" }}>
              Track workouts, nutrition, and progress in one place.
            </h2>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mb-10 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              {[
                { icon: Dumbbell, label: "Workouts" },
                { icon: Apple, label: "Nutrition" },
                { icon: TrendingUp, label: "Progress" },
                { icon: Trophy, label: "Gamification" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-xs font-medium text-foreground">
                  <Icon size={12} className="text-primary" />
                  {label}
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
                  Start Workout
                  <ChevronRight size={18} className="ml-1.5" />
                </Button>
              </a>
              <p className="text-center text-xs text-muted-foreground">
                Free to start · No credit card required
              </p>
            </div>
          </main>

          {/* ── Social proof ── */}
          <footer className="pb-12 border-t border-border/40 pt-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex justify-around">
              {[
                { value: "50K+", label: "Athletes" },
                { value: "4.9★", label: "Rating" },
                { value: "10+", label: "Features" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-lg font-display font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </footer>

        </div>
      </div>
    );
  }

  // If authenticated, show Today Dashboard
  // Calculate XP progress (simplified: use totalXP % 500)
  const xpProgress = (engagement?.totalXP || 0) % 500;
  const xpNeeded = 500;
  const xpPercent = (xpProgress / xpNeeded) * 100;
  const currentStreak = 0; // TODO: fetch from engagement or separate query
  // dailyGoals is a single object with boolean fields
  const goalsCompleted = [
    dailyGoals?.workoutCompleted,
    dailyGoals?.mealsLogged,
    dailyGoals?.activityCompleted,
  ].filter(Boolean).length || 0;
  const totalGoals = 3;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border/40">
        <div className="max-w-[430px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap size={16} className="text-white" fill="currentColor" />
            </div>
            <span className="text-lg font-bold text-foreground">Today</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[430px] mx-auto px-6 py-6 space-y-6">

        {/* XP Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">Level {engagement?.currentLevel || 1}</h2>
            <span className="text-xs text-muted-foreground">{Math.round(xpPercent)}%</span>
          </div>
          <div className="w-full h-2 bg-card rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{xpProgress} / {xpNeeded} XP</p>
        </div>

        {/* Tier Badge */}
        {engagement?.currentTier && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/60">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Trophy size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Current Tier</p>
              <p className="text-sm font-bold text-foreground capitalize">{engagement.currentTier}</p>
            </div>
          </div>
        )}

        {/* Big Start Workout Button */}
        <button
          onClick={() => navigate("/workout")}
          className="w-full p-6 rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-between group hover:shadow-[0_0_30px_oklch(0.60_0.22_240/0.4)] transition-all duration-300 active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Dumbbell size={24} />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold opacity-90">Ready to train?</p>
              <p className="text-lg font-bold">Start Workout</p>
            </div>
          </div>
          <ChevronRight size={20} className="opacity-70 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Streak & Goals Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Streak */}
          <div className="p-4 rounded-2xl bg-card border border-border/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Flame size={18} className="text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Streak</p>
              <p className="text-xl font-bold text-foreground">{currentStreak}</p>
            </div>
          </div>

          {/* Daily Goals */}
          <div className="p-4 rounded-2xl bg-card border border-border/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Target size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Goals</p>
              <p className="text-xl font-bold text-foreground">{goalsCompleted}/{totalGoals}</p>
            </div>
          </div>
        </div>

        {/* Daily Goals Section */}
        {dailyGoals && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Today's Goals</h3>
            <div className="space-y-2">
              {[
                { id: 1, goal: "Workout", completed: dailyGoals.workoutCompleted },
                { id: 2, goal: "Log Meals", completed: dailyGoals.mealsLogged },
                { id: 3, goal: "Activity", completed: dailyGoals.activityCompleted },
              ].map((goal: any) => (
                <div
                  key={goal.id}
                  className="p-3 rounded-lg bg-card border border-border/60 flex items-center gap-3 hover:border-primary/40 transition-colors"
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      goal.completed
                        ? "bg-primary border-primary"
                        : "border-border/60"
                    }`}
                  >
                    {goal.completed && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground capitalize">{goal.goal}</p>
                  </div>
                  {goal.completed && <span className="text-xs text-primary font-semibold">Done</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/fuel")}
            className="p-4 rounded-xl bg-card border border-border/60 flex flex-col items-center gap-2 hover:border-primary/40 transition-colors active:scale-95"
          >
            <Apple size={20} className="text-green-500" />
            <span className="text-xs font-medium text-foreground">Log Food</span>
          </button>
          <button
            onClick={() => navigate("/habits")}
            className="p-4 rounded-xl bg-card border border-border/60 flex flex-col items-center gap-2 hover:border-primary/40 transition-colors active:scale-95"
          >
            <Target size={20} className="text-blue-500" />
            <span className="text-xs font-medium text-foreground">Habits</span>
          </button>
        </div>

      </div>
    </div>
  );
}
