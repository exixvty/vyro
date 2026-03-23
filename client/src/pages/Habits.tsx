import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Plus, Flame, CheckCircle2, Circle, Trash2, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { CheckmarkButton, XPGainToast } from "@/components/Interactive";
import { useLevelUp } from "@/hooks/useLevelUp";

const HABIT_ICONS = ["💪", "🏃", "🥗", "💧", "😴", "🧘", "📚", "🚴", "🏊", "⚽", "🎯", "🔥"];
const HABIT_COLORS = ["violet", "blue", "green", "orange", "red", "pink"];
const COLOR_MAP: Record<string, string> = {
  violet: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  green: "bg-green-500/20 text-green-400 border-green-500/30",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  red: "bg-red-500/20 text-red-400 border-red-500/30",
  pink: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

export default function Habits() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [showAddForm, setShowAddForm] = useState(false);
  const [xpGain, setXpGain] = useState<{ visible: boolean; amount: number }>({ visible: false, amount: 0 });

  const utils = trpc.useUtils();
  const triggerLevelUp = useLevelUp();
  const { data: habitList } = trpc.habits.list.useQuery();
  const { data: completions } = trpc.habits.getCompletions.useQuery({ date: today });

  const completeHabit = trpc.habits.complete.useMutation({
    onSuccess: (data) => {
      utils.habits.getCompletions.invalidate();
      utils.habits.list.invalidate();
      setXpGain({ visible: true, amount: 30 });
      setTimeout(() => setXpGain({ visible: false, amount: 0 }), 1000);
      toast.success("Habit done! +30 XP 🔥");
      if (data?.levelUp?.leveledUp) {
        triggerLevelUp({
          newLevel: data.levelUp.newLevel,
          oldLevel: data.levelUp.oldLevel,
          newTier: data.levelUp.newTier,
          oldTier: data.levelUp.oldTier,
          tierChanged: data.levelUp.tierChanged,
          xpGained: 30,
          totalXP: data.levelUp.totalXP,
        });
      }
    },
    onError: () => toast.error("Failed to update habit"),
  });

  const deleteHabit = trpc.habits.delete.useMutation({
    onSuccess: () => { utils.habits.list.invalidate(); toast.success("Habit removed"); },
  });

  const completedIds = new Set(completions?.map((c) => c.habitId) ?? []);
  const completedCount = completedIds.size;
  const totalCount = habitList?.length ?? 0;
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* XP Gain Toast */}
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[80] pointer-events-none">
        <XPGainToast amount={xpGain.amount} visible={xpGain.visible} />
      </div>

      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-display font-bold text-foreground mb-1">Habits</h1>
        <p className="text-muted-foreground text-sm">{format(new Date(), "EEEE, MMMM d")}</p>
      </div>

      {/* Progress overview */}
      <div className="px-5 mb-5">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-3xl font-display font-bold text-foreground">{completedCount}/{totalCount}</p>
              <p className="text-sm text-muted-foreground">habits completed today</p>
            </div>
            <div className="w-16 h-16 rounded-full flex items-center justify-center relative">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="var(--muted)" strokeWidth="6" />
                <circle cx="32" cy="32" r="26" fill="none" stroke="var(--primary)" strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  strokeDashoffset={`${2 * Math.PI * 26 * (1 - completionRate / 100)}`}
                  strokeLinecap="round" className="transition-all duration-700" />
              </svg>
              <span className="absolute text-sm font-bold text-foreground">{Math.round(completionRate)}%</span>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${completionRate}%` }} />
          </div>
        </div>
      </div>

      {/* Habits list */}
      <div className="px-5 space-y-3 mb-5">
        {!habitList?.length ? (
          <div className="flex flex-col items-center py-12 text-center">
            <Flame size={48} className="text-muted-foreground/30 mb-4" />
            <p className="font-semibold text-foreground">No habits yet</p>
            <p className="text-sm text-muted-foreground mb-4">Build powerful daily routines</p>
            <Button onClick={() => setShowAddForm(true)} className="rounded-xl">
              <Plus size={16} className="mr-2" />Add First Habit
            </Button>
          </div>
        ) : (
          habitList.map((habit) => {
            const isCompleted = completedIds.has(habit.id);
            const colorClass = COLOR_MAP[habit.color] || COLOR_MAP.violet;

            return (
              <div
                key={habit.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl border press-scale",
                  isCompleted ? "border-green-500/30 bg-green-500/5" : "border-border bg-card"
                )}
                style={{ transition: "background 0.4s ease, border-color 0.4s ease, transform 0.15s ease" }}
              >
                <div className="relative shrink-0">
                  {isCompleted ? (
                    <div className={cn("w-12 h-12 rounded-2xl border flex items-center justify-center text-xl", "bg-green-500/20 border-green-500/30")}>
                      <span style={{ animation: "pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>✅</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => completeHabit.mutate({ habitId: habit.id, date: today })}
                      className={cn("w-12 h-12 rounded-2xl border flex items-center justify-center text-xl transition-all", colorClass)}
                    >
                      {habit.icon}
                    </button>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("font-semibold text-sm", isCompleted ? "line-through text-muted-foreground" : "text-foreground")}>
                    {habit.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Flame size={12} className="text-orange-400" />
                    <span className="text-xs text-muted-foreground">{habit.currentStreak} day streak</span>
                    {habit.longestStreak > 0 && (
                      <span className="text-xs text-muted-foreground">· Best: {habit.longestStreak}</span>
                    )}
                  </div>
                </div>
                <button onClick={() => deleteHabit.mutate({ id: habit.id })}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {habitList && habitList.length > 0 && (
        <div className="px-5 mb-8">
          <Button variant="outline" className="w-full h-12 rounded-2xl" onClick={() => setShowAddForm(true)}>
            <Plus size={16} className="mr-2" />Add Habit
          </Button>
        </div>
      )}

      {/* Streak showcase */}
      {habitList && habitList.length > 0 && (
        <div className="px-5 mb-8">
          <h3 className="font-semibold text-sm mb-3">Streak Leaders</h3>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {[...habitList].sort((a, b) => b.currentStreak - a.currentStreak).slice(0, 5).map((habit) => (
              <div key={habit.id} className="shrink-0 flex flex-col items-center gap-2 p-3 bg-card border border-border rounded-2xl min-w-[80px]">
                <span className="text-2xl">{habit.icon}</span>
                <div className="flex items-center gap-1">
                  <Flame size={12} className="text-orange-400 animate-streak" />
                  <span className="text-sm font-bold text-foreground">{habit.currentStreak}</span>
                </div>
                <p className="text-[10px] text-muted-foreground text-center truncate w-full">{habit.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add habit modal */}
      {showAddForm && <AddHabitModal onClose={() => setShowAddForm(false)} />}
    </div>
  );
}

function AddHabitModal({ onClose }: { onClose: () => void }) {
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("💪");
  const [color, setColor] = useState("violet");
  const [targetDays, setTargetDays] = useState([0, 1, 2, 3, 4, 5, 6]);

  const createHabit = trpc.habits.create.useMutation({
    onSuccess: () => { utils.habits.list.invalidate(); onClose(); toast.success("Habit created!"); },
  });

  const toggleDay = (day: number) => {
    setTargetDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const days = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end max-w-[430px] mx-auto">
      <div className="w-full bg-card border-t border-border rounded-t-3xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-lg">New Habit</h3>
          <button onClick={onClose}><X size={20} className="text-muted-foreground" /></button>
        </div>

        <input placeholder="Habit name (e.g. Morning Run)" value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-12 px-4 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 mb-4" />

        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Icon</p>
          <div className="flex gap-2 flex-wrap">
            {HABIT_ICONS.map((ic) => (
              <button key={ic} onClick={() => setIcon(ic)}
                className={cn("w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all",
                  icon === ic ? "border-primary bg-primary/10" : "border-border bg-muted")}>
                {ic}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Color</p>
          <div className="flex gap-2">
            {HABIT_COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)}
                className={cn("w-8 h-8 rounded-full border-2 transition-all", COLOR_MAP[c].split(" ")[0],
                  color === c ? "border-foreground scale-110" : "border-transparent")}>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <p className="text-xs text-muted-foreground mb-2">Repeat on</p>
          <div className="flex gap-2">
            {days.map((day, i) => (
              <button key={i} onClick={() => toggleDay(i)}
                className={cn("flex-1 h-9 rounded-xl text-xs font-semibold border transition-all",
                  targetDays.includes(i) ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground")}>
                {day}
              </button>
            ))}
          </div>
        </div>

        <Button className="w-full h-12 rounded-xl glow-primary" onClick={() => createHabit.mutate({ name, icon, color, targetDays })}
          disabled={!name || createHabit.isPending}>
          {createHabit.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Plus size={16} className="mr-2" />}
          Create Habit
        </Button>
      </div>
    </div>
  );
}
