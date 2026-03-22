import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GripVertical, Plus, X, Play, Trash2, Edit2, Search } from "lucide-react";
import { toast } from "sonner";

interface WorkoutExercise {
  id: string;
  exerciseId: number;
  exerciseName: string;
  category: string;
  sets: number;
  reps: number;
  weight: number;
  weightUnit: "kg" | "lbs";
  restSeconds: number;
  notes: string;
}

export default function WorkoutBuilder() {
  const { user } = useAuth();
  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);

  const { data: allExercises = [] } = trpc.exercises.getAll.useQuery();

  const filteredExercises = useMemo(() => {
    return allExercises
      .filter((ex: any) => {
        if (selectedCategory !== "all" && ex.category !== selectedCategory) return false;
        return ex.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
  }, [allExercises, searchQuery, selectedCategory]);

  const categories = [
    "all",
    "chest",
    "back",
    "shoulders",
    "biceps",
    "triceps",
    "forearms",
    "legs",
    "glutes",
    "core",
    "cardio",
    "functional",
  ];

  const handleAddExercise = (exercise: any): void => {
    const newExercise: WorkoutExercise = {
      id: `${Date.now()}-${Math.random()}`,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      category: exercise.category,
      sets: 3,
      reps: 8,
      weight: 20,
      weightUnit: "kg",
      restSeconds: 90,
      notes: "",
    };
    setExercises([...exercises, newExercise]);
    setShowExerciseModal(false);
    toast.success(`${exercise.name} added to workout`);
  };

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleUpdateExercise = (id: string, updates: Partial<WorkoutExercise>) => {
    setExercises(exercises.map(ex => (ex.id === id ? { ...ex, ...updates } : ex)));
  };

  const handleStartWorkout = async () => {
    if (!workoutName.trim()) {
      toast.error("Please name your workout");
      return;
    }
    if (exercises.length === 0) {
      toast.error("Add at least one exercise");
      return;
    }
    // TODO: Create workout session and navigate to active workout
    toast.success("Workout started!");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Create Workout</h1>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Workout Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Workout Name</label>
          <Input
            placeholder="e.g., Chest & Triceps"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            className="text-base"
          />
        </div>

        {/* Add Exercise Button */}
        <Button
          onClick={() => setShowExerciseModal(true)}
          className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Exercise
        </Button>

        {/* Exercises List */}
        {exercises.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">
              {exercises.length} Exercise{exercises.length !== 1 ? "s" : ""}
            </h2>
            {exercises.map((exercise, index) => (
              <Card key={exercise.id} className="p-4 bg-card border-border">
                <div className="flex items-start gap-3">
                  <GripVertical className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{exercise.exerciseName}</h3>
                        <p className="text-xs text-muted-foreground capitalize">{exercise.category}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveExercise(exercise.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Exercise Settings */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-background rounded p-2">
                        <label className="text-xs text-muted-foreground block mb-1">Sets</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleUpdateExercise(exercise.id, {
                                sets: Math.max(1, exercise.sets - 1),
                              })
                            }
                            className="w-6 h-6 rounded bg-border hover:bg-muted flex items-center justify-center"
                          >
                            −
                          </button>
                          <span className="font-semibold text-center flex-1">{exercise.sets}</span>
                          <button
                            onClick={() =>
                              handleUpdateExercise(exercise.id, {
                                sets: exercise.sets + 1,
                              })
                            }
                            className="w-6 h-6 rounded bg-border hover:bg-muted flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="bg-background rounded p-2">
                        <label className="text-xs text-muted-foreground block mb-1">Reps</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleUpdateExercise(exercise.id, {
                                reps: Math.max(1, exercise.reps - 1),
                              })
                            }
                            className="w-6 h-6 rounded bg-border hover:bg-muted flex items-center justify-center"
                          >
                            −
                          </button>
                          <span className="font-semibold text-center flex-1">{exercise.reps}</span>
                          <button
                            onClick={() =>
                              handleUpdateExercise(exercise.id, {
                                reps: exercise.reps + 1,
                              })
                            }
                            className="w-6 h-6 rounded bg-border hover:bg-muted flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="bg-background rounded p-2">
                        <label className="text-xs text-muted-foreground block mb-1">Weight</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={exercise.weight}
                            onChange={(e) =>
                              handleUpdateExercise(exercise.id, {
                                weight: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-12 bg-border rounded px-2 py-1 text-center text-sm"
                          />
                          <span className="text-xs text-muted-foreground">{exercise.weightUnit}</span>
                        </div>
                      </div>

                      <div className="bg-background rounded p-2">
                        <label className="text-xs text-muted-foreground block mb-1">Rest (sec)</label>
                        <input
                          type="number"
                          value={exercise.restSeconds}
                          onChange={(e) =>
                            handleUpdateExercise(exercise.id, {
                              restSeconds: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full bg-border rounded px-2 py-1 text-center text-sm"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <input
                      type="text"
                      placeholder="Add notes..."
                      value={exercise.notes}
                      onChange={(e) =>
                        handleUpdateExercise(exercise.id, { notes: e.target.value })
                      }
                      className="w-full mt-2 bg-background border border-border rounded px-2 py-1 text-sm text-foreground placeholder-muted-foreground"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No exercises added yet</p>
            <p className="text-sm text-muted-foreground">Click "Add Exercise" to get started</p>
          </div>
        )}

        {/* Start Workout Button */}
        {exercises.length > 0 && (
          <Button
            onClick={handleStartWorkout}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Workout
          </Button>
        )}
      </div>

      {/* Exercise Selection Modal */}
      <Dialog open={showExerciseModal} onOpenChange={setShowExerciseModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Exercise</DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start overflow-x-auto bg-background border-b border-border rounded-none">
                {categories.map((cat) => (
                  <TabsTrigger key={cat} value={cat} className="capitalize">
                    {cat === "all" ? "All" : cat}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={selectedCategory} className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="space-y-2 p-4">
                    {filteredExercises.length > 0 ? (
                      filteredExercises.map((exercise) => (
                        <button
                          key={exercise.id}
                          onClick={() => handleAddExercise(exercise)}
                          className="w-full text-left p-3 rounded-lg bg-card border border-border hover:border-violet-500 hover:bg-violet-500/10 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-foreground">{exercise.name}</h4>
                              <p className="text-xs text-muted-foreground capitalize">
                                {exercise.type} • {exercise.difficulty}
                              </p>
                            </div>
                            <Plus className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No exercises found</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
