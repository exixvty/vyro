import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  ChevronRight,
  ChevronLeft,
  Zap,
  Target,
  Dumbbell,
  Flame,
  Activity,
  Waves,
  PersonStanding,
  Trophy,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TOTAL_STEPS = 5;

const GOALS = [
  { id: "fat_loss", label: "Fat Loss", icon: Flame, desc: "Burn fat & get lean", color: "text-orange-400" },
  { id: "lean_bulk", label: "Lean Bulk", icon: TrendingUp2, desc: "Build muscle, stay lean", color: "text-blue-400" },
  { id: "muscle_gain", label: "Muscle Gain", icon: Dumbbell, desc: "Maximize muscle size", color: "text-purple-400" },
  { id: "athlete_performance", label: "Performance", icon: Trophy, desc: "Improve athleticism", color: "text-yellow-400" },
  { id: "general_fitness", label: "General Fitness", icon: Activity, desc: "Stay healthy & active", color: "text-green-400" },
];

const ATHLETE_TYPES = [
  { id: "bodybuilder", label: "Bodybuilder", icon: "💪" },
  { id: "footballer", label: "Footballer", icon: "⚽" },
  { id: "runner", label: "Runner", icon: "🏃" },
  { id: "swimmer", label: "Swimmer", icon: "🏊" },
  { id: "basketball", label: "Basketball", icon: "🏀" },
  { id: "general", label: "General", icon: "🎯" },
];

const FITNESS_LEVELS = [
  { id: "beginner", label: "Beginner", desc: "New to fitness", stars: 1 },
  { id: "intermediate", label: "Intermediate", desc: "1-3 years training", stars: 2 },
  { id: "advanced", label: "Advanced", desc: "3+ years training", stars: 3 },
  { id: "athlete", label: "Athlete", desc: "Competitive level", stars: 4 },
];

function TrendingUp2(props: any) {
  return <Activity {...props} />;
}

export default function Onboarding() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    age: "",
    heightCm: "",
    weightKg: "",
    primaryGoal: "",
    athleteType: "",
    fitnessLevel: "",
    unitSystem: "metric" as "metric" | "imperial",
  });

  const upsertProfile = trpc.profile.upsert.useMutation({
    onSuccess: () => {
      navigate("/dashboard");
    },
    onError: () => toast.error("Failed to save profile"),
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-primary/20 animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 gap-6">
        <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
          <Zap size={28} className="text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold text-center">Sign in to get started</h2>
        <p className="text-muted-foreground text-center">Create your VYRO account to begin your fitness journey</p>
        <a href={getLoginUrl()} className="w-full max-w-sm">
          <Button size="lg" className="w-full h-14 rounded-2xl glow-primary">
            Sign In / Sign Up
          </Button>
        </a>
      </div>
    );
  }

  const handleComplete = () => {
    upsertProfile.mutate({
      age: data.age ? parseInt(data.age) : undefined,
      heightCm: data.heightCm ? parseFloat(data.heightCm) : undefined,
      weightKg: data.weightKg ? parseFloat(data.weightKg) : undefined,
      primaryGoal: data.primaryGoal as any,
      athleteType: data.athleteType as any,
      fitnessLevel: data.fitnessLevel as any,
      unitSystem: data.unitSystem,
      onboardingCompleted: true,
    });
  };

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-[430px] mx-auto">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      {/* Header */}
      <div className="relative px-6 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Zap size={16} className="text-primary-foreground" fill="currentColor" />
          </div>
          <span className="font-display font-bold text-lg gradient-text">VYRO</span>
        </div>

        {/* Progress bar */}
        <div className="progress-bar mb-2">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-muted-foreground">Step {step} of {TOTAL_STEPS}</p>
      </div>

      {/* Content */}
      <div className="relative flex-1 px-6 pb-8 overflow-y-auto">
        {step === 1 && (
          <StepGoal
            selected={data.primaryGoal}
            onSelect={(v) => setData((d) => ({ ...d, primaryGoal: v }))}
          />
        )}
        {step === 2 && (
          <StepAthleteType
            selected={data.athleteType}
            onSelect={(v) => setData((d) => ({ ...d, athleteType: v }))}
          />
        )}
        {step === 3 && (
          <StepFitnessLevel
            selected={data.fitnessLevel}
            onSelect={(v) => setData((d) => ({ ...d, fitnessLevel: v }))}
          />
        )}
        {step === 4 && (
          <StepBodyStats
            data={data}
            onChange={(k, v) => setData((d) => ({ ...d, [k]: v }))}
          />
        )}
        {step === 5 && (
          <StepComplete data={data} />
        )}
      </div>

      {/* Navigation */}
      <div className="relative px-6 pb-8 flex gap-3">
        {step > 1 && (
          <Button
            variant="outline"
            size="lg"
            className="flex-1 h-14 rounded-2xl"
            onClick={() => setStep((s) => s - 1)}
          >
            <ChevronLeft size={18} className="mr-1" />
            Back
          </Button>
        )}
        <Button
          size="lg"
          className="flex-1 h-14 rounded-2xl glow-primary font-semibold"
          disabled={
            (step === 1 && !data.primaryGoal) ||
            (step === 2 && !data.athleteType) ||
            (step === 3 && !data.fitnessLevel) ||
            upsertProfile.isPending
          }
          onClick={() => {
            if (step < TOTAL_STEPS) setStep((s) => s + 1);
            else handleComplete();
          }}
        >
          {step === TOTAL_STEPS ? (
            upsertProfile.isPending ? "Saving..." : "Start Training 🚀"
          ) : (
            <>
              Continue
              <ChevronRight size={18} className="ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function StepGoal({ selected, onSelect }: { selected: string; onSelect: (v: string) => void }) {
  return (
    <div className="animate-slide-up">
      <h2 className="text-3xl font-display font-bold mb-2">What's your goal?</h2>
      <p className="text-muted-foreground mb-8">We'll build your plan around this.</p>
      <div className="space-y-3">
        {GOALS.map(({ id, label, icon: Icon, desc, color }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left",
              selected === id
                ? "border-primary bg-primary/10 glow-sm"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <div className={cn("w-10 h-10 rounded-xl bg-muted flex items-center justify-center", selected === id && "bg-primary/20")}>
              <Icon size={20} className={color} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{label}</p>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
            {selected === id && <CheckCircle2 size={20} className="text-primary shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepAthleteType({ selected, onSelect }: { selected: string; onSelect: (v: string) => void }) {
  return (
    <div className="animate-slide-up">
      <h2 className="text-3xl font-display font-bold mb-2">Your sport?</h2>
      <p className="text-muted-foreground mb-8">Workouts will be tailored to your activity.</p>
      <div className="grid grid-cols-2 gap-3">
        {ATHLETE_TYPES.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={cn(
              "flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-200",
              selected === id
                ? "border-primary bg-primary/10 glow-sm"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <span className="text-3xl">{icon}</span>
            <span className="font-semibold text-sm text-foreground">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepFitnessLevel({ selected, onSelect }: { selected: string; onSelect: (v: string) => void }) {
  return (
    <div className="animate-slide-up">
      <h2 className="text-3xl font-display font-bold mb-2">Experience level?</h2>
      <p className="text-muted-foreground mb-8">Be honest — we'll calibrate intensity for you.</p>
      <div className="space-y-3">
        {FITNESS_LEVELS.map(({ id, label, desc, stars }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left",
              selected === id
                ? "border-primary bg-primary/10 glow-sm"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <div className="flex-1">
              <p className="font-semibold text-foreground">{label}</p>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-6 rounded-full transition-all",
                    i < stars ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepBodyStats({ data, onChange }: { data: any; onChange: (k: string, v: string) => void }) {
  return (
    <div className="animate-slide-up">
      <h2 className="text-3xl font-display font-bold mb-2">Your stats</h2>
      <p className="text-muted-foreground mb-8">Optional — helps us personalize your plan.</p>

      {/* Unit toggle */}
      <div className="flex gap-2 mb-6 p-1 bg-muted rounded-xl">
        {["metric", "imperial"].map((unit) => (
          <button
            key={unit}
            onClick={() => onChange("unitSystem", unit)}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
              data.unitSystem === unit ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            {unit === "metric" ? "Metric (kg/cm)" : "Imperial (lbs/ft)"}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {[
          { key: "age", label: "Age", placeholder: "25", suffix: "years" },
          { key: "heightCm", label: data.unitSystem === "metric" ? "Height" : "Height", placeholder: data.unitSystem === "metric" ? "175" : "69", suffix: data.unitSystem === "metric" ? "cm" : "in" },
          { key: "weightKg", label: "Weight", placeholder: data.unitSystem === "metric" ? "75" : "165", suffix: data.unitSystem === "metric" ? "kg" : "lbs" },
        ].map(({ key, label, placeholder, suffix }) => (
          <div key={key}>
            <label className="text-sm font-medium text-foreground mb-2 block">{label}</label>
            <div className="relative">
              <input
                type="number"
                value={data[key]}
                onChange={(e) => onChange(key, e.target.value)}
                placeholder={placeholder}
                className="w-full h-14 px-4 pr-16 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                {suffix}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepComplete({ data }: { data: any }) {
  const goalLabels: Record<string, string> = {
    fat_loss: "Fat Loss",
    lean_bulk: "Lean Bulk",
    muscle_gain: "Muscle Gain",
    athlete_performance: "Performance",
    general_fitness: "General Fitness",
  };

  return (
    <div className="animate-scale-in flex flex-col items-center text-center py-8">
      <div className="w-24 h-24 rounded-3xl bg-primary/20 flex items-center justify-center mb-6 animate-pulse-glow">
        <Zap size={40} className="text-primary" fill="currentColor" />
      </div>
      <h2 className="text-3xl font-display font-bold mb-3">You're all set!</h2>
      <p className="text-muted-foreground mb-8 max-w-xs">
        Your personalized fitness journey is ready. Let's crush those goals together.
      </p>
      <div className="w-full space-y-3 text-left">
        {[
          { label: "Goal", value: goalLabels[data.primaryGoal] || data.primaryGoal },
          { label: "Level", value: data.fitnessLevel },
          { label: "Sport", value: data.athleteType },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border">
            <span className="text-muted-foreground text-sm">{label}</span>
            <span className="font-semibold text-foreground capitalize">{value?.replace(/_/g, " ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
