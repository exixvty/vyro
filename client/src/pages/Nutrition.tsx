import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Apple, Plus, Trash2, Brain, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { XPGainToast } from "@/components/Interactive";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

const MEAL_ICONS: Record<MealType, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  snack: "🍎",
};

const MEAL_COLORS: Record<MealType, string> = {
  breakfast: "text-orange-400",
  lunch: "text-yellow-400",
  dinner: "text-blue-400",
  snack: "text-green-400",
};

const QUICK_FOODS = [
  { name: "Chicken Breast (100g)", calories: 165, proteinG: 31, carbsG: 0, fatG: 3.6 },
  { name: "Brown Rice (100g)", calories: 112, proteinG: 2.6, carbsG: 23.5, fatG: 0.9 },
  { name: "Eggs (2 large)", calories: 156, proteinG: 12, carbsG: 1.2, fatG: 10.6 },
  { name: "Banana", calories: 89, proteinG: 1.1, carbsG: 23, fatG: 0.3 },
  { name: "Greek Yogurt (200g)", calories: 130, proteinG: 17, carbsG: 9, fatG: 3 },
  { name: "Oats (80g)", calories: 303, proteinG: 10.7, carbsG: 51.7, fatG: 5.5 },
  { name: "Salmon (150g)", calories: 280, proteinG: 39, carbsG: 0, fatG: 13 },
  { name: "Sweet Potato (150g)", calories: 129, proteinG: 2.3, carbsG: 30, fatG: 0.1 },
];

export default function Nutrition() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [showAddForm, setShowAddForm] = useState(false);
  const [xpGain, setXpGain] = useState<{ visible: boolean; amount: number }>({ visible: false, amount: 0 });
  const [selectedMeal, setSelectedMeal] = useState<MealType>("breakfast");
  const [form, setForm] = useState({ foodName: "", calories: "", proteinG: "", carbsG: "", fatG: "", servingSize: "" });
  const [showAISuggest, setShowAISuggest] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [expandedMeal, setExpandedMeal] = useState<MealType | null>("breakfast");

  const utils = trpc.useUtils();
  const { data: logs } = trpc.nutrition.getDayLogs.useQuery({ date: today });
  const { data: goals } = trpc.nutrition.getGoals.useQuery();
  const { data: profile } = trpc.profile.get.useQuery();

  const logFood = trpc.nutrition.logFood.useMutation({
    onSuccess: () => {
      utils.nutrition.getDayLogs.invalidate();
      setShowAddForm(false);
      setForm({ foodName: "", calories: "", proteinG: "", carbsG: "", fatG: "", servingSize: "" });
      setXpGain({ visible: true, amount: 20 });
      setTimeout(() => setXpGain({ visible: false, amount: 0 }), 1000);
      toast.success("Food logged! +20 XP 🍎");
    },
  });

  const deleteLog = trpc.nutrition.deleteLog.useMutation({
    onSuccess: () => utils.nutrition.getDayLogs.invalidate(),
  });

  const suggestMeal = trpc.nutrition.suggestMeal.useMutation({
    onSuccess: (data) => setAiSuggestions(data.meals || []),
    onError: () => toast.error("Failed to get suggestions"),
  });

  const totalCalories = logs?.reduce((s, l) => s + l.calories, 0) ?? 0;
  const totalProtein = logs?.reduce((s, l) => s + (l.proteinG ?? 0), 0) ?? 0;
  const totalCarbs = logs?.reduce((s, l) => s + (l.carbsG ?? 0), 0) ?? 0;
  const totalFat = logs?.reduce((s, l) => s + (l.fatG ?? 0), 0) ?? 0;

  const calorieGoal = goals?.dailyCalories ?? 2000;
  const proteinGoal = goals?.proteinG ?? 150;
  const carbsGoal = goals?.carbsG ?? 200;
  const fatGoal = goals?.fatG ?? 65;

  const calorieProgress = Math.min(100, (totalCalories / calorieGoal) * 100);
  const remaining = Math.max(0, calorieGoal - totalCalories);

  const mealLogs = (meal: MealType) => logs?.filter((l) => l.mealType === meal) ?? [];

  const handleSubmit = () => {
    if (!form.foodName || !form.calories) return;
    logFood.mutate({
      logDate: today,
      mealType: selectedMeal,
      foodName: form.foodName,
      calories: parseFloat(form.calories),
      proteinG: form.proteinG ? parseFloat(form.proteinG) : undefined,
      carbsG: form.carbsG ? parseFloat(form.carbsG) : undefined,
      fatG: form.fatG ? parseFloat(form.fatG) : undefined,
      servingSize: form.servingSize || undefined,
    });
  };

  const addQuickFood = (food: (typeof QUICK_FOODS)[0]) => {
    logFood.mutate({
      logDate: today,
      mealType: selectedMeal,
      foodName: food.name,
      calories: food.calories,
      proteinG: food.proteinG,
      carbsG: food.carbsG,
      fatG: food.fatG,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* XP Gain Toast */}
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[80] pointer-events-none">
        <XPGainToast amount={xpGain.amount} visible={xpGain.visible} />
      </div>

      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-display font-bold text-foreground mb-1">Nutrition</h1>
        <p className="text-muted-foreground text-sm">{format(new Date(), "EEEE, MMMM d")}</p>
      </div>

      {/* Calorie ring summary */}
      <div className="px-5 mb-5">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-3xl font-display font-bold text-foreground">{Math.round(totalCalories)}</p>
              <p className="text-sm text-muted-foreground">of {calorieGoal} kcal</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-display font-bold text-primary">{Math.round(remaining)}</p>
              <p className="text-sm text-muted-foreground">remaining</p>
            </div>
          </div>
          <div className="progress-bar mb-4">
            <div className="progress-fill" style={{ width: `${calorieProgress}%` }} />
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Protein", value: totalProtein, goal: proteinGoal, color: "bg-blue-400" },
              { label: "Carbs", value: totalCarbs, goal: carbsGoal, color: "bg-orange-400" },
              { label: "Fat", value: totalFat, goal: fatGoal, color: "bg-yellow-400" },
            ].map(({ label, value, goal, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-foreground font-medium">{Math.round(value)}g</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${Math.min(100, (value / goal) * 100)}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">/ {goal}g</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Suggest */}
      <div className="px-5 mb-4">
        <button
          onClick={() => {
            setShowAISuggest(!showAISuggest);
            if (!showAISuggest && aiSuggestions.length === 0) {
              suggestMeal.mutate({
                goal: profile?.primaryGoal || "general_fitness",
                mealType: selectedMeal,
                calories: Math.round(remaining / 2),
              });
            }
          }}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card border border-border"
        >
          <Brain size={18} className="text-primary" />
          <span className="flex-1 text-sm font-medium text-left">AI Meal Suggestions</span>
          {suggestMeal.isPending ? <Loader2 size={16} className="animate-spin text-muted-foreground" /> : showAISuggest ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </button>

        {showAISuggest && aiSuggestions.length > 0 && (
          <div className="mt-2 space-y-2 animate-slide-up">
            {aiSuggestions.map((meal, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-medium text-sm text-foreground">{meal.name}</p>
                  <p className="text-xs text-muted-foreground">{meal.calories} kcal · P:{meal.protein}g C:{meal.carbs}g F:{meal.fat}g</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => {
                  setForm({ foodName: meal.name, calories: String(meal.calories), proteinG: String(meal.protein || 0), carbsG: String(meal.carbs || 0), fatG: String(meal.fat || 0), servingSize: "" });
                  setShowAddForm(true);
                }}>
                  <Plus size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Meal sections */}
      <div className="px-5 space-y-3 mb-5">
        {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map((meal) => {
          const items = mealLogs(meal);
          const mealCals = items.reduce((s, l) => s + l.calories, 0);
          const isExpanded = expandedMeal === meal;

          return (
            <div key={meal} className="bg-card border border-border rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpandedMeal(isExpanded ? null : meal)}
                className="w-full flex items-center gap-3 p-4"
              >
                <span className="text-xl">{MEAL_ICONS[meal]}</span>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm capitalize text-foreground">{meal}</p>
                  <p className="text-xs text-muted-foreground">{items.length} items · {Math.round(mealCals)} kcal</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedMeal(meal); setShowAddForm(true); }}
                  className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mr-2"
                >
                  <Plus size={14} className="text-primary" />
                </button>
                {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-2">
                  {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">No food logged yet</p>
                  ) : items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-2 border-t border-border/50">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{item.foodName}</p>
                        <p className="text-xs text-muted-foreground">{item.calories} kcal{item.proteinG ? ` · P:${item.proteinG}g` : ""}</p>
                      </div>
                      <button onClick={() => deleteLog.mutate({ id: item.id })} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}

                  {/* Quick add */}
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground mb-2">Quick add:</p>
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                      {QUICK_FOODS.slice(0, 5).map((food) => (
                        <button
                          key={food.name}
                          onClick={() => { setSelectedMeal(meal); addQuickFood(food); }}
                          className="shrink-0 px-3 py-1.5 rounded-xl bg-muted text-xs font-medium text-foreground whitespace-nowrap"
                        >
                          {food.name.split(" (")[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add food modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end max-w-[430px] mx-auto">
          <div className="w-full bg-card border-t border-border rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-lg">Log Food</h3>
              <button onClick={() => setShowAddForm(false)} className="text-muted-foreground">✕</button>
            </div>

            {/* Meal selector */}
            <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
              {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map((m) => (
                <button key={m} onClick={() => setSelectedMeal(m)}
                  className={cn("shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border capitalize transition-all",
                    selectedMeal === m ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground")}>
                  {MEAL_ICONS[m]} {m}
                </button>
              ))}
            </div>

            <div className="space-y-3 mb-4">
              <input placeholder="Food name *" value={form.foodName} onChange={(e) => setForm((f) => ({ ...f, foodName: e.target.value }))}
                className="w-full h-12 px-4 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Calories *" type="number" value={form.calories} onChange={(e) => setForm((f) => ({ ...f, calories: e.target.value }))}
                  className="h-12 px-4 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <input placeholder="Serving size" value={form.servingSize} onChange={(e) => setForm((f) => ({ ...f, servingSize: e.target.value }))}
                  className="h-12 px-4 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <input placeholder="Protein (g)" type="number" value={form.proteinG} onChange={(e) => setForm((f) => ({ ...f, proteinG: e.target.value }))}
                  className="h-12 px-4 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <input placeholder="Carbs (g)" type="number" value={form.carbsG} onChange={(e) => setForm((f) => ({ ...f, carbsG: e.target.value }))}
                  className="h-12 px-4 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <input placeholder="Fat (g)" type="number" value={form.fatG} onChange={(e) => setForm((f) => ({ ...f, fatG: e.target.value }))}
                  className="h-12 px-4 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>

            <Button className="w-full h-12 rounded-xl glow-primary" onClick={handleSubmit} disabled={logFood.isPending || !form.foodName || !form.calories}>
              {logFood.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Plus size={16} className="mr-2" />}
              Log Food
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
