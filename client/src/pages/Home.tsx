import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dumbbell,
  Zap,
  TrendingUp,
  Users,
  Star,
  ChevronRight,
  Flame,
  Brain,
  Apple,
  Trophy,
} from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // SEO: Set page title and meta description
  useEffect(() => {
    document.title = "VYRO — All-in-One Fitness App";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Stop using 5 fitness apps. Track workouts, nutrition, habits, and progress in one place with VYRO. AI-powered fitness tracking with gamification.');
    }
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'fitness app, workout tracker, nutrition tracking, habit builder, gamification, exercise routine, strength training, fitness goals');
    }
  }, []);

  const { data: profile } = trpc.profile.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (profile !== undefined) {
        if (profile?.onboardingCompleted) {
          navigate("/dashboard");
        } else {
          navigate("/onboarding");
        }
      }
    }
  }, [loading, isAuthenticated, profile, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center animate-pulse-glow">
            <Dumbbell className="text-primary" size={32} />
          </div>
          <p className="text-muted-foreground text-sm">Loading VYRO...</p>
        </div>
      </div>
    );
  }

  const features = [
    { icon: Brain, label: "AI Trainer", desc: "Personalized workouts", color: "text-purple-400" },
    { icon: Apple, label: "Nutrition", desc: "Smart meal tracking", color: "text-green-400" },
    { icon: TrendingUp, label: "Progress", desc: "Visual analytics", color: "text-blue-400" },
    { icon: Trophy, label: "Gamification", desc: "XP & achievements", color: "text-yellow-400" },
    { icon: Flame, label: "Habits", desc: "Daily streaks", color: "text-orange-400" },
    { icon: Users, label: "Social", desc: "Community feed", color: "text-pink-400" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[100px]" />
      </div>

      <div className="relative max-w-[430px] mx-auto px-6 py-12 flex flex-col min-h-screen">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-16 animate-slide-up">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-sm">
            <Zap size={20} className="text-primary-foreground" fill="currentColor" />
          </div>
          <span className="text-2xl font-display font-bold gradient-text">VYRO</span>
        </div>

        {/* Hero */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
              <Star size={12} fill="currentColor" />
              All-in-one fitness platform
            </div>
            <h1 className="text-6xl font-display font-bold leading-tight mb-4">
              Stop using 5 fitness apps.
              <br />
              <span className="gradient-text">Use VYRO.</span>
            </h1>
            <h2 className="text-lg text-muted-foreground leading-relaxed mb-10">
              Track workouts, nutrition, and progress in one place.
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-10">
              Replace Strava, MyFitnessPal & Nike Training Club with one elegant app. AI-powered, beautifully designed.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-3 gap-3 mb-10 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            {features.map(({ icon: Icon, label, desc, color }) => (
              <div
                key={label}
                className="bg-card border border-border rounded-2xl p-3 flex flex-col gap-2"
              >
                <Icon size={20} className={color} />
                <div>
                  <p className="text-xs font-semibold text-foreground">{label}</p>
                  <p className="text-[10px] text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <a href={getLoginUrl()} className="block">
              <Button
                size="lg"
                className="w-full h-16 text-lg font-semibold rounded-2xl glow-primary transition-all duration-300 hover:scale-[1.02] shadow-lg"
              >
                Start Workout
                <ChevronRight size={20} className="ml-2" />
              </Button>
            </a>
            <p className="text-center text-xs text-muted-foreground">
              14-day free trial · No credit card required
            </p>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="mt-12 pt-6 border-t border-border/50 flex justify-around animate-slide-up" style={{ animationDelay: "0.4s" }}>
          {[
            { value: "50K+", label: "Athletes" },
            { value: "4.9★", label: "Rating" },
            { value: "10+", label: "Features" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-xl font-display font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
