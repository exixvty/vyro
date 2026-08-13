import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft, Crown, Check, Zap, Brain, Dumbbell, Apple, Trophy,
  Users, Star, Type, Palette, Heart, Sparkles, Shield, Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const PLANS = [
  {
    id: "monthly",
    name: "Monthly",
    price: "$9.99",
    period: "/month",
    savings: null,
    popular: false,
  },
  {
    id: "yearly",
    name: "Yearly",
    price: "$4.99",
    period: "/month",
    savings: "Save 50%",
    popular: true,
    billed: "Billed $59.99/year",
  },
  {
    id: "lifetime",
    name: "Lifetime",
    price: "$99",
    period: " once",
    savings: "Best Value",
    popular: false,
  },
];

const FREE_FEATURES = [
  "3 AI workout plans per month",
  "Basic nutrition tracking",
  "7-day workout history",
  "5 habits tracking",
  "Basic progress charts",
  "Default app theme only",
];

const PREMIUM_FEATURES = [
  { icon: Brain, text: "Unlimited AI workout generation", highlight: true, category: "fitness" },
  { icon: Dumbbell, text: "Advanced training programs", highlight: true, category: "fitness" },
  { icon: Apple, text: "AI meal planning & nutrition coach", highlight: true, category: "fitness" },
  { icon: Heart, text: "Addiction Recovery Module (Sober-style)", highlight: true, category: "wellness" },
  { icon: Type, text: "Custom fonts & typography", highlight: true, category: "customization" },
  { icon: Palette, text: "Custom outline & border styles", highlight: true, category: "customization" },
  { icon: Sparkles, text: "App name & logo customization", highlight: true, category: "customization" },
  { icon: Trophy, text: "Exclusive achievements & badges", highlight: false, category: "gamification" },
  { icon: Users, text: "Priority community features", highlight: false, category: "social" },
  { icon: Zap, text: "Real-time form analysis (coming soon)", highlight: false, category: "fitness" },
  { icon: Star, text: "Custom workout templates", highlight: false, category: "fitness" },
  { icon: Crown, text: "Ad-free experience", highlight: false, category: "general" },
  { icon: Shield, text: "Priority support", highlight: false, category: "general" },
];

const CATEGORY_LABELS: Record<string, string> = {
  fitness: "Fitness",
  wellness: "Wellness",
  customization: "Customization",
  gamification: "Gamification",
  social: "Social",
  general: "General",
};

export default function Premium() {
  const [, navigate] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const utils = trpc.useUtils();
  const { data: premiumStatus, isLoading: premiumLoading } = trpc.recovery.checkPremium.useQuery();
  const startTrial = trpc.profile.startTrial.useMutation({
    onSuccess: (result) => {
      utils.recovery.checkPremium.invalidate();
      utils.profile.get.invalidate();
      if (result.reason === "already_premium") {
        toast.success("Your VYRO Pro membership is already active.");
      } else if (result.reason === "already_active") {
        toast.success("Your 21-day free trial is already active.");
      } else if (result.reason === "already_used") {
        toast.error("This account has already used its free trial.");
        return;
      } else {
        toast.success("21-day free trial started! Welcome to VYRO Pro 👑", { duration: 4000 });
      }
      setTimeout(() => navigate("/dashboard"), 700);
    },
    onError: () => toast.error("We couldn't start your free trial. Please try again."),
  });

  const handleSubscribe = () => {
    startTrial.mutate();
  };

  const selectedPlanData = PLANS.find((p) => p.id === selectedPlan);

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1 as any)}
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-2xl font-display font-bold text-foreground">Premium</h1>
      </div>

      {/* Hero */}
      <div className="px-5 mb-6">
        <div className="relative rounded-3xl overflow-hidden bg-card border border-border p-6 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/15 via-primary/10 to-transparent" />
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-yellow-400/20 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_oklch(0.85_0.18_85/0.3)]">
              <Crown size={32} className="text-yellow-400" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">VYRO Pro</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Unlock AI coaching, addiction recovery, full customization, and unlimited features.
            </p>
            {/* 21-day trial badge */}
            <div className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-sm font-bold">
              <Zap size={14} />
              {premiumStatus?.isInTrial
                ? `${premiumStatus.trialDaysLeft} Trial Day${premiumStatus.trialDaysLeft === 1 ? "" : "s"} Remaining`
                : "21-Day Free Trial — No Credit Card Required"}
            </div>
          </div>
        </div>
      </div>

      {/* Plan selector */}
      <div className="px-5 mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Choose Your Plan</p>
        <div className="space-y-3">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left relative",
                selectedPlan === plan.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card"
              )}
            >
              {plan.popular && (
                <span className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                  Most Popular
                </span>
              )}
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                selectedPlan === plan.id ? "border-primary" : "border-border"
              )}>
                {selectedPlan === plan.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{plan.name}</p>
                {plan.billed && <p className="text-xs text-muted-foreground">{plan.billed}</p>}
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-foreground text-lg">
                  {plan.price}
                  <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
                </p>
                {plan.savings && (
                  <span className="text-xs font-semibold text-green-400">{plan.savings}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Premium Features — grouped */}
      <div className="px-5 mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Everything in Premium</p>

        {/* Highlighted / new features */}
        <div className="space-y-2 mb-4">
          {PREMIUM_FEATURES.filter((f) => f.highlight).map(({ icon: Icon, text, category }) => (
            <div
              key={text}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-primary/5 border border-primary/20"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <Icon size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground leading-tight">{text}</p>
                <p className="text-[10px] text-primary/70 uppercase tracking-wider mt-0.5">{CATEGORY_LABELS[category]}</p>
              </div>
              <Check size={14} className="text-green-400 shrink-0" />
            </div>
          ))}
        </div>

        {/* Standard features */}
        <div className="space-y-2">
          {PREMIUM_FEATURES.filter((f) => !f.highlight).map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 p-3 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Icon size={15} className="text-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground flex-1">{text}</span>
              <Check size={13} className="text-green-400 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Free vs Premium comparison */}
      <div className="px-5 mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Free Plan Limits</p>
        <div className="bg-card border border-border rounded-2xl p-4 space-y-2.5">
          {FREE_FEATURES.map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Lock size={10} className="text-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5">
        <Button
          className="w-full h-14 rounded-2xl font-bold text-base glow-primary mb-3"
          onClick={handleSubscribe}
          disabled={premiumLoading || startTrial.isPending || premiumStatus?.isPremium}
        >
          <Crown size={18} className="mr-2 text-yellow-400" />
          {startTrial.isPending
            ? "Starting Trial..."
            : premiumStatus?.isPaidPremium
              ? "Premium Active"
              : premiumStatus?.isInTrial
                ? "Free Trial Active"
                : "Start 21-Day Free Trial"}
        </Button>
        <p className="text-center text-xs text-muted-foreground mb-2">
          Then {selectedPlanData?.price}{selectedPlanData?.period} · Cancel anytime
        </p>
        <p className="text-center text-[10px] text-muted-foreground/60">
          No credit card required to start your trial
        </p>
      </div>
    </div>
  );
}
