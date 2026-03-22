import { useState, useMemo } from "react";
import { Search, BookOpen, ChevronRight, Star, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const MUSCLE_ICONS: Record<string, string> = {
  chest: "💪",
  back: "🔙",
  shoulders: "🏋️",
  biceps: "💪",
  triceps: "💪",
  forearms: "🤝",
  legs: "🦵",
  glutes: "🍑",
  core: "⚡",
  cardio: "❤️",
  functional: "🎯",
};

const DIFF_COLORS: Record<string, string> = {
  beginner: "text-green-400 bg-green-400/10",
  intermediate: "text-yellow-400 bg-yellow-400/10",
  advanced: "text-red-400 bg-red-400/10",
};

export default function Library() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [type, setType] = useState("all");
  const [equipment, setEquipment] = useState("all");
  const [selected, setSelected] = useState<any | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Fetch all exercises
  const { data: allExercises = [], isLoading } = trpc.exercises.getAll.useQuery();

  // Fetch categories, muscle groups, equipment
  const { data: categories = [] } = trpc.exercises.getCategories.useQuery();
  const { data: muscleGroups = [] } = trpc.exercises.getMuscleGroups.useQuery();
  const { data: equipmentList = [] } = trpc.exercises.getEquipment.useQuery();

  const filtered = useMemo(() => {
    let results = allExercises;

    // Search by name
    if (search) {
      results = results.filter((ex) => ex.name.toLowerCase().includes(search.toLowerCase()));
    }

    // Filter by category
    if (category !== "all") {
      results = results.filter((ex) => ex.category === category);
    }

    // Filter by difficulty
    if (difficulty !== "all") {
      results = results.filter((ex) => ex.difficulty === difficulty);
    }

    // Filter by type
    if (type !== "all") {
      results = results.filter((ex) => ex.type === type);
    }

    // Filter by equipment
    if (equipment !== "all") {
      results = results.filter((ex) => {
        const exEquip = JSON.parse(ex.equipment as string);
        return exEquip.includes(equipment);
      });
    }

    return results;
  }, [allExercises, search, category, difficulty, type, equipment]);

  const toggleFavorite = (id: number) => {
    const newFavs = new Set(favorites);
    if (newFavs.has(id)) {
      newFavs.delete(id);
    } else {
      newFavs.add(id);
    }
    setFavorites(newFavs);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-violet-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="text-violet-500" size={24} />
          <h1 className="text-2xl font-bold">Exercise Library</h1>
        </div>
        <p className="text-sm text-muted-foreground">{filtered.length} exercises</p>
      </div>

      {/* Search */}
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
          <Input
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-muted border-border"
          />
        </div>

        {/* Filters */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground">CATEGORY</div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setCategory("all")}
              className={cn(
                "px-3 py-1 rounded-full text-sm whitespace-nowrap transition",
                category === "all"
                  ? "bg-violet-500 text-white"
                  : "bg-muted text-foreground hover:bg-muted/80"
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-3 py-1 rounded-full text-sm whitespace-nowrap transition capitalize",
                  category === cat
                    ? "bg-violet-500 text-white"
                    : "bg-muted text-foreground hover:bg-muted/80"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground">TYPE</div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setType("all")}
              className={cn(
                "px-3 py-1 rounded-full text-sm whitespace-nowrap transition",
                type === "all"
                  ? "bg-violet-500 text-white"
                  : "bg-muted text-foreground hover:bg-muted/80"
              )}
            >
              All
            </button>
            {["compound", "isolation", "cardio", "functional"].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  "px-3 py-1 rounded-full text-sm whitespace-nowrap transition capitalize",
                  type === t
                    ? "bg-violet-500 text-white"
                    : "bg-muted text-foreground hover:bg-muted/80"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground">DIFFICULTY</div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setDifficulty("all")}
              className={cn(
                "px-3 py-1 rounded-full text-sm whitespace-nowrap transition",
                difficulty === "all"
                  ? "bg-violet-500 text-white"
                  : "bg-muted text-foreground hover:bg-muted/80"
              )}
            >
              All
            </button>
            {["beginner", "intermediate", "advanced"].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={cn(
                  "px-3 py-1 rounded-full text-sm whitespace-nowrap transition capitalize",
                  difficulty === d
                    ? "bg-violet-500 text-white"
                    : "bg-muted text-foreground hover:bg-muted/80"
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment Filter */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground">EQUIPMENT</div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setEquipment("all")}
              className={cn(
                "px-3 py-1 rounded-full text-sm whitespace-nowrap transition",
                equipment === "all"
                  ? "bg-violet-500 text-white"
                  : "bg-muted text-foreground hover:bg-muted/80"
              )}
            >
              All
            </button>
            {equipmentList.map((eq) => (
              <button
                key={eq}
                onClick={() => setEquipment(eq)}
                className={cn(
                  "px-3 py-1 rounded-full text-sm whitespace-nowrap transition capitalize",
                  equipment === eq
                    ? "bg-violet-500 text-white"
                    : "bg-muted text-foreground hover:bg-muted/80"
                )}
              >
                {eq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exercise List */}
      <div className="p-4 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No exercises found</p>
          </div>
        ) : (
          filtered.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => setSelected(exercise)}
              className="w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition text-left border border-border"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{MUSCLE_ICONS[exercise.category] || "💪"}</span>
                    <h3 className="font-semibold">{exercise.name}</h3>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", DIFF_COLORS[exercise.difficulty])}>
                      {exercise.difficulty}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground space-x-2">
                    <span className="capitalize">{exercise.type}</span>
                    <span>•</span>
                    <span>{JSON.parse(exercise.equipment as string).join(", ")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(exercise.id);
                    }}
                    className="p-2 hover:bg-background rounded-lg transition"
                  >
                    <Star
                      size={18}
                      className={favorites.has(exercise.id) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}
                    />
                  </button>
                  <ChevronRight className="text-muted-foreground" size={20} />
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-end">
          <div className="w-full bg-background rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{MUSCLE_ICONS[selected.category] || "💪"}</span>
                <div>
                  <h2 className="text-2xl font-bold">{selected.name}</h2>
                  <p className="text-sm text-muted-foreground capitalize">{selected.category}</p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 hover:bg-muted rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{selected.description}</p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Type</p>
                  <p className="font-semibold capitalize text-sm">{selected.type}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Difficulty</p>
                  <p className={cn("font-semibold text-sm capitalize", DIFF_COLORS[selected.difficulty])}>
                    {selected.difficulty}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Equipment</p>
                  <p className="font-semibold text-sm">{JSON.parse(selected.equipment as string).length}</p>
                </div>
              </div>

              {/* Equipment */}
              <div>
                <h3 className="font-semibold mb-2">Equipment</h3>
                <div className="flex flex-wrap gap-2">
                  {JSON.parse(selected.equipment as string).map((eq: string) => (
                    <span key={eq} className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-sm capitalize">
                      {eq}
                    </span>
                  ))}
                </div>
              </div>

              {/* Muscle Groups */}
              <div>
                <h3 className="font-semibold mb-2">Muscle Groups</h3>
                <div className="flex flex-wrap gap-2">
                  {JSON.parse(selected.muscleGroups as string).map((muscle: string) => (
                    <span key={muscle} className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm capitalize">
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => toggleFavorite(selected.id)}
                  variant="outline"
                  className="flex-1"
                >
                  <Star size={18} className="mr-2" />
                  {favorites.has(selected.id) ? "Favorited" : "Favorite"}
                </Button>
                <Button className="flex-1 bg-violet-500 hover:bg-violet-600">
                  Add to Workout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
