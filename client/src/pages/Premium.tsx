import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Crown, Check, Zap, Brain, Dumbbell, Apple, Trophy, Users, Star } from "lucide-react";
import { cn } from "@/lib/utils";
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
];

const PREMIUM_FEATURES = [
  { icon: Brain, text: "Unlimited AI workout generation", highlight: true },
  { icon: Dumbbell, text: "Advanced training programs", highlight: true },
  { icon: Apple, text: "AI meal planning & nutrition coach", highlight: true },
  { icon: Trophy, text: "Exclusive achievements & badges", highlight: false },
  { icon: Users, text: "Priority community features", highlight: false },
  { icon: Zap, text: "Real-time form analysis (coming soon)", highlight: false },
  { icon: Star, text: "Custom workout templates", highlight: false },
  { icon: Crown, text: "Ad-free experience", highlight: false },
];

export default function Premium() {
  const [, navigate] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState("yearly");

  const handleSubscribe = () => {
    toast.success("Premium activated! Welcome to VYRO Pro 👑", { duration: 4000 });
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1 as any)} className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center">
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-2xl font-display font-bold text-foreground">Premium</h1>
      </div>

      {/* Hero */}
      <div className="px-5 mb-6">
        <div className="relative rounded-3xl overflow-hidden bg-card border border-border p-6 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-yellow-400/10" />
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-yellow-400/20 flex items-center justify-center mx-auto mb-4">
              <Crown size={32} className="text-yellow-400" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">VYRO Pro</h2>
            <p className="text-muted-foreground text-sm">Unlock your full potential with AI-powered coaching, unlimited plans, and exclusive features.</p>
          </div>
        </div>
      </div>

      {/* Plan selector */}
      <div className="px-5 mb-6">
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
                <span className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase">
                  Most Popular
                </span>
              )}
              <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                selectedPlan === plan.id ? "border-primary" : "border-border")}>
                {selectedPlan === plan.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{plan.name}</p>
                {plan.billed && <p className="text-xs text-muted-foreground">{plan.billed}</p>}
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-foreground text-lg">{plan.price}<span className="text-sm font-normal text-muted-foreground">{plan.period}</span></p>
                {plan.savings && (
                  <span className="text-xs font-semibold text-green-400">{plan.savings}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Features comparison */}
      <div className="px-5 mb-6">
        <h3 className="font-semibold text-sm mb-4">Everything in Premium</h3>
        <div className="space-y-3">
          {PREMIUM_FEATURES.map(({ icon: Icon, text, highlight }) => (
            <div key={text} className={cn("flex items-center gap-3 p-3 rounded-xl",
              highlight ? "bg-primary/5 border border-primary/20" : "")}>
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                highlight ? "bg-primary/20" : "bg-muted")}>
                <Icon size={16} className={highlight ? "text-primary" : "text-muted-foreground"} />
              </div>
              <span className={cn("text-sm", highlight ? "font-medium text-foreground" : "text-muted-foreground")}>{text}</span>
              <Check size={14} className="text-green-400 ml-auto shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Free vs Premium */}
      <div className="px-5 mb-6">
        <h3 className="font-semibold text-sm mb-3">Free Plan Limits</h3>
        <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
          {FREE_FEATURES.map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                <span className="text-[10px] text-muted-foreground">✕</span>
              </div>
              <span className="text-sm text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-10">
        <Button
          className="w-full h-14 rounded-2xl font-semibold text-base glow-primary mb-3"
          onClick={handleSubscribe}
        >
          <Crown size={18} className="mr-2 text-yellow-400" />
          Start Premium — {PLANS.find((p) => p.id === selectedPlan)?.price}{PLANS.find((p) => p.id === selectedPlan)?.period}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Cancel anytime · 21-day free trial · Secure payment
        </p>
      </div>
    </div>
  );
}
