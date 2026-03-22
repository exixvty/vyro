import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2, Bell, Moon, Sun, Palette, Target, Scale, Ruler } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ACCENT_COLORS = [
  { id: "violet", label: "Violet", hex: "#8b5cf6" },
  { id: "blue", label: "Blue", hex: "#3b82f6" },
  { id: "cyan", label: "Cyan", hex: "#06b6d4" },
  { id: "green", label: "Green", hex: "#22c55e" },
  { id: "orange", label: "Orange", hex: "#f97316" },
  { id: "pink", label: "Pink", hex: "#ec4899" },
  { id: "red", label: "Red", hex: "#ef4444" },
  { id: "yellow", label: "Gold", hex: "#eab308" },
];

const GOAL_OPTIONS = [
  { id: "fat_loss", label: "Fat Loss" },
  { id: "lean_bulk", label: "Lean Bulk" },
  { id: "muscle_gain", label: "Muscle Gain" },
  { id: "athlete_performance", label: "Performance" },
  { id: "general_fitness", label: "General Fitness" },
];

const LEVEL_OPTIONS = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
  { id: "athlete", label: "Athlete" },
];

export default function Settings() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { data: profile } = trpc.profile.get.useQuery();
  const { data: goals } = trpc.nutrition.getGoals.useQuery();

  const [accentColor, setAccentColor] = useState("violet");
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [workoutReminder, setWorkoutReminder] = useState(true);

  const [profileForm, setProfileForm] = useState<{
    primaryGoal: string;
    fitnessLevel: string;
    weightKg: string;
    heightCm: string;
    age: string;
  }>({
    primaryGoal: profile?.primaryGoal || "general_fitness",
    fitnessLevel: profile?.fitnessLevel || "intermediate",
    weightKg: String(profile?.weightKg || ""),
    heightCm: String(profile?.heightCm || ""),
    age: String(profile?.age || ""),
  });

  const [nutritionForm, setNutritionForm] = useState({
    dailyCalories: String(goals?.dailyCalories || "2000"),
    proteinG: String(goals?.proteinG || "150"),
    carbsG: String(goals?.carbsG || "200"),
    fatG: String(goals?.fatG || "65"),
  });

  const utils = trpc.useUtils();

  const upsertProfile = trpc.profile.upsert.useMutation({
    onSuccess: () => { utils.profile.get.invalidate(); toast.success("Profile updated!"); },
  });

  const setNutritionGoals = trpc.nutrition.setGoals.useMutation({
    onSuccess: () => { utils.nutrition.getGoals.invalidate(); toast.success("Nutrition goals updated!"); },
  });

  const applyAccentColor = (colorId: string) => {
    setAccentColor(colorId);
    const color = ACCENT_COLORS.find((c) => c.id === colorId);
    if (color) {
      document.documentElement.style.setProperty("--primary", color.hex);
      toast.success(`Theme changed to ${color.label}!`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/profile")} className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center">
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
      </div>

      <div className="px-5 space-y-6 pb-10">
        {/* Appearance */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Appearance</h2>
          <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
            {/* Dark mode toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon size={18} className="text-muted-foreground" /> : <Sun size={18} className="text-muted-foreground" />}
                <span className="text-sm font-medium text-foreground">Dark Mode</span>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={cn("w-12 h-6 rounded-full transition-all relative",
                  darkMode ? "bg-primary" : "bg-muted")}
              >
                <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all",
                  darkMode ? "left-6" : "left-0.5")} />
              </button>
            </div>

            {/* Accent color */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Palette size={18} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Accent Color</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {ACCENT_COLORS.map(({ id, label, hex }) => (
                  <button
                    key={id}
                    onClick={() => applyAccentColor(id)}
                    title={label}
                    className={cn("w-9 h-9 rounded-xl transition-all border-2",
                      accentColor === id ? "border-foreground scale-110" : "border-transparent")}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Notifications</h2>
          <div className="bg-card border border-border rounded-2xl divide-y divide-border">
            {[
              { label: "Push Notifications", icon: Bell, state: notifications, toggle: () => setNotifications(!notifications) },
              { label: "Workout Reminders", icon: Bell, state: workoutReminder, toggle: () => setWorkoutReminder(!workoutReminder) },
            ].map(({ label, icon: Icon, state, toggle }) => (
              <div key={label} className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <Icon size={18} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </div>
                <button onClick={toggle}
                  className={cn("w-12 h-6 rounded-full transition-all relative", state ? "bg-primary" : "bg-muted")}>
                  <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all", state ? "left-6" : "left-0.5")} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Fitness Profile */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Fitness Profile</h2>
          <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block flex items-center gap-1">
                <Target size={12} /> Primary Goal
              </label>
              <div className="flex gap-2 flex-wrap">
                {GOAL_OPTIONS.map(({ id, label }) => (
                  <button key={id} onClick={() => setProfileForm((f) => ({ ...f, primaryGoal: id }))}
                    className={cn("px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
                      profileForm.primaryGoal === id ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground")}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Fitness Level</label>
              <div className="flex gap-2">
                {LEVEL_OPTIONS.map(({ id, label }) => (
                  <button key={id} onClick={() => setProfileForm((f) => ({ ...f, fitnessLevel: id }))}
                    className={cn("flex-1 py-2 rounded-xl text-xs font-medium border transition-all",
                      profileForm.fitnessLevel === id ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground")}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { key: "weightKg", label: "Weight (kg)", icon: Scale },
                { key: "heightCm", label: "Height (cm)", icon: Ruler },
                { key: "age", label: "Age", icon: Target },
              ].map(({ key, label, icon: Icon }) => (
                <div key={key}>
                  <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
                  <input type="number" value={(profileForm as any)[key]}
                    onChange={(e) => setProfileForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full h-11 px-3 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              ))}
            </div>

            <Button className="w-full h-11 rounded-xl" onClick={() => upsertProfile.mutate({
              primaryGoal: profileForm.primaryGoal as any,
              fitnessLevel: profileForm.fitnessLevel as any,
              weightKg: profileForm.weightKg ? parseFloat(profileForm.weightKg) : undefined,
              heightCm: profileForm.heightCm ? parseFloat(profileForm.heightCm) : undefined,
              age: profileForm.age ? parseInt(profileForm.age) : undefined,
            })} disabled={upsertProfile.isPending}>
              {upsertProfile.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
              Save Profile
            </Button>
          </div>
        </section>

        {/* Nutrition Goals */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Nutrition Goals</h2>
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "dailyCalories", label: "Daily Calories (kcal)" },
                { key: "proteinG", label: "Protein (g)" },
                { key: "carbsG", label: "Carbs (g)" },
                { key: "fatG", label: "Fat (g)" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
                  <input type="number" value={(nutritionForm as any)[key]}
                    onChange={(e) => setNutritionForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full h-11 px-3 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              ))}
            </div>
            <Button className="w-full h-11 rounded-xl" onClick={() => setNutritionGoals.mutate({
              dailyCalories: parseInt(nutritionForm.dailyCalories),
              proteinG: parseInt(nutritionForm.proteinG),
              carbsG: parseInt(nutritionForm.carbsG),
              fatG: parseInt(nutritionForm.fatG),
            })} disabled={setNutritionGoals.isPending}>
              {setNutritionGoals.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
              Save Nutrition Goals
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
