import { useState, useMemo } from "react";
import { Search, BookOpen, ChevronRight, Star, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const EXERCISES = [
  { id: 1, name: "Bench Press", muscle: "chest", equipment: "barbell", difficulty: "intermediate", desc: "Lie on a flat bench, grip the barbell slightly wider than shoulder-width. Lower to chest, press up explosively.", tips: "Keep shoulder blades retracted. Don't bounce the bar off your chest.", sets: "3-5", reps: "5-12" },
  { id: 2, name: "Squat", muscle: "legs", equipment: "barbell", difficulty: "intermediate", desc: "Stand with feet shoulder-width apart, barbell on upper back. Squat until thighs are parallel to floor.", tips: "Keep chest up, knees tracking over toes. Drive through heels.", sets: "3-5", reps: "5-10" },
  { id: 3, name: "Deadlift", muscle: "back", equipment: "barbell", difficulty: "advanced", desc: "Stand over barbell, hip-width stance. Hinge at hips, grip bar, drive through floor to stand.", tips: "Maintain neutral spine. Bar stays close to body throughout.", sets: "3-5", reps: "3-8" },
  { id: 4, name: "Pull-Up", muscle: "back", equipment: "bodyweight", difficulty: "intermediate", desc: "Hang from bar with overhand grip. Pull chest to bar, lower with control.", tips: "Engage lats before pulling. Avoid swinging.", sets: "3-4", reps: "5-12" },
  { id: 5, name: "Overhead Press", muscle: "shoulders", equipment: "barbell", difficulty: "intermediate", desc: "Stand with barbell at shoulder height. Press overhead until arms are locked out.", tips: "Squeeze glutes and core. Don't hyperextend lower back.", sets: "3-4", reps: "6-10" },
  { id: 6, name: "Dumbbell Row", muscle: "back", equipment: "dumbbell", difficulty: "beginner", desc: "Brace on bench with one hand. Pull dumbbell to hip, elbow close to body.", tips: "Full range of motion. Squeeze at top.", sets: "3-4", reps: "8-15" },
  { id: 7, name: "Dips", muscle: "chest", equipment: "bodyweight", difficulty: "intermediate", desc: "Grip parallel bars, lower body until elbows at 90°, press back up.", tips: "Lean forward for chest emphasis, upright for triceps.", sets: "3-4", reps: "8-15" },
  { id: 8, name: "Bicep Curl", muscle: "arms", equipment: "dumbbell", difficulty: "beginner", desc: "Stand with dumbbells at sides, curl to shoulder height keeping elbows fixed.", tips: "Don't swing. Full extension at bottom.", sets: "3-4", reps: "10-15" },
  { id: 9, name: "Tricep Pushdown", muscle: "arms", equipment: "cable", difficulty: "beginner", desc: "Stand at cable machine, push bar down until arms fully extended.", tips: "Keep elbows at sides. Squeeze at bottom.", sets: "3-4", reps: "12-15" },
  { id: 10, name: "Plank", muscle: "core", equipment: "bodyweight", difficulty: "beginner", desc: "Hold push-up position with forearms on ground. Keep body straight.", tips: "Don't let hips sag or rise. Breathe steadily.", sets: "3", reps: "30-60s" },
  { id: 11, name: "Running", muscle: "cardio", equipment: "none", difficulty: "beginner", desc: "Steady-state or interval running for cardiovascular fitness.", tips: "Land midfoot. Maintain upright posture.", sets: "1", reps: "20-60min" },
  { id: 12, name: "Box Jump", muscle: "legs", equipment: "box", difficulty: "intermediate", desc: "Stand before box, swing arms and jump onto it, land softly.", tips: "Land with bent knees. Step down, don't jump down.", sets: "3-4", reps: "5-8" },
  { id: 13, name: "Romanian Deadlift", muscle: "legs", equipment: "barbell", difficulty: "intermediate", desc: "Hold barbell, hinge at hips keeping legs nearly straight, lower to mid-shin.", tips: "Feel hamstring stretch. Keep bar close to legs.", sets: "3-4", reps: "8-12" },
  { id: 14, name: "Lateral Raise", muscle: "shoulders", equipment: "dumbbell", difficulty: "beginner", desc: "Stand with dumbbells at sides, raise arms out to shoulder height.", tips: "Slight bend in elbows. Don't shrug.", sets: "3-4", reps: "12-20" },
  { id: 15, name: "Cable Fly", muscle: "chest", equipment: "cable", difficulty: "intermediate", desc: "Set cables at shoulder height, step forward and bring handles together.", tips: "Slight bend in elbows throughout. Squeeze chest at center.", sets: "3-4", reps: "12-15" },
  { id: 16, name: "Hip Thrust", muscle: "legs", equipment: "barbell", difficulty: "intermediate", desc: "Sit with upper back on bench, barbell on hips. Drive hips up to full extension.", tips: "Squeeze glutes at top. Chin tucked.", sets: "3-4", reps: "10-15" },
  { id: 17, name: "Face Pull", muscle: "shoulders", equipment: "cable", difficulty: "beginner", desc: "Pull cable rope to face level, elbows high and wide.", tips: "External rotation at end. Great for shoulder health.", sets: "3-4", reps: "15-20" },
  { id: 18, name: "Leg Press", muscle: "legs", equipment: "machine", difficulty: "beginner", desc: "Sit in machine, feet on platform. Press weight away, lower with control.", tips: "Don't lock knees. Full range of motion.", sets: "3-4", reps: "10-15" },
];

const MUSCLES = ["all", "chest", "back", "shoulders", "arms", "legs", "core", "cardio"];
const DIFFICULTIES = ["all", "beginner", "intermediate", "advanced"];
const EQUIPMENT_LIST = ["all", "barbell", "dumbbell", "bodyweight", "cable", "machine", "none"];

const MUSCLE_ICONS: Record<string, string> = {
  chest: "💪", back: "🔙", shoulders: "🏋️", arms: "💪", legs: "🦵", core: "⚡", cardio: "❤️",
};

const DIFF_COLORS: Record<string, string> = {
  beginner: "text-green-400 bg-green-400/10",
  intermediate: "text-yellow-400 bg-yellow-400/10",
  advanced: "text-red-400 bg-red-400/10",
};

export default function Library() {
  const [search, setSearch] = useState("");
  const [muscle, setMuscle] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [equipment, setEquipment] = useState("all");
  const [selected, setSelected] = useState<(typeof EXERCISES)[0] | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const filtered = useMemo(() => {
    return EXERCISES.filter((ex) => {
      const matchSearch = !search || ex.name.toLowerCase().includes(search.toLowerCase());
      const matchMuscle = muscle === "all" || ex.muscle === muscle;
      const matchDiff = difficulty === "all" || ex.difficulty === difficulty;
      const matchEquip = equipment === "all" || ex.equipment === equipment;
      return matchSearch && matchMuscle && matchDiff && matchEquip;
    });
  }, [search, muscle, difficulty, equipment]);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-display font-bold text-foreground mb-1">Exercise Library</h1>
        <p className="text-muted-foreground text-sm">{EXERCISES.length} exercises with instructions</p>
      </div>

      {/* Search */}
      <div className="px-5 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-10 pr-4 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Muscle filter */}
      <div className="px-5 mb-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {MUSCLES.map((m) => (
            <button key={m} onClick={() => setMuscle(m)}
              className={cn("shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border capitalize transition-all",
                muscle === m ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground bg-card")}>
              {m !== "all" && <span>{MUSCLE_ICONS[m]}</span>}
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty + Equipment filters */}
      <div className="px-5 mb-4 flex gap-2">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide flex-1">
          {DIFFICULTIES.map((d) => (
            <button key={d} onClick={() => setDifficulty(d)}
              className={cn("shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all",
                difficulty === d ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground")}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="px-5 mb-3">
        <p className="text-xs text-muted-foreground">{filtered.length} exercises</p>
      </div>

      {/* Exercise list */}
      <div className="px-5 space-y-2 pb-6">
        {filtered.map((exercise) => (
          <button key={exercise.id} onClick={() => setSelected(exercise)}
            className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-2xl text-left transition-all hover:border-primary/30">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-xl shrink-0">
              {MUSCLE_ICONS[exercise.muscle] || "💪"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-semibold text-sm text-foreground">{exercise.name}</p>
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md font-medium capitalize", DIFF_COLORS[exercise.difficulty])}>
                  {exercise.difficulty}
                </span>
              </div>
              <p className="text-xs text-muted-foreground capitalize">{exercise.muscle} · {exercise.equipment}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={(e) => { e.stopPropagation(); toggleFavorite(exercise.id); }}
                className="p-1">
                <Star size={16} className={favorites.has(exercise.id) ? "text-yellow-400" : "text-muted-foreground"}
                  fill={favorites.has(exercise.id) ? "currentColor" : "none"} />
              </button>
              <ChevronRight size={16} className="text-muted-foreground" />
            </div>
          </button>
        ))}
      </div>

      {/* Exercise detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end max-w-[430px] mx-auto">
          <div className="w-full bg-card border-t border-border rounded-t-3xl p-6 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-2xl">
                  {MUSCLE_ICONS[selected.muscle] || "💪"}
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-foreground">{selected.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn("text-xs px-2 py-0.5 rounded-md font-medium capitalize", DIFF_COLORS[selected.difficulty])}>
                      {selected.difficulty}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">{selected.muscle}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground">✕</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Sets", value: selected.sets },
                  { label: "Reps", value: selected.reps },
                  { label: "Equipment", value: selected.equipment },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-muted rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">{label}</p>
                    <p className="text-sm font-semibold text-foreground capitalize">{value}</p>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2 text-foreground">How to perform</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{selected.desc}</p>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <h4 className="font-semibold text-sm mb-2 text-primary">Pro Tips</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{selected.tips}</p>
              </div>

              <button
                onClick={() => toggleFavorite(selected.id)}
                className={cn("w-full h-12 rounded-xl border font-medium text-sm flex items-center justify-center gap-2 transition-all",
                  favorites.has(selected.id)
                    ? "bg-yellow-400/10 border-yellow-400/30 text-yellow-400"
                    : "border-border text-muted-foreground")}
              >
                <Star size={16} fill={favorites.has(selected.id) ? "currentColor" : "none"} />
                {favorites.has(selected.id) ? "Saved to Favorites" : "Save to Favorites"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
