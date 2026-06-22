import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Trophy, Loader2, X, Camera, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { ConfettiEffect, XPGainToast } from "@/components/Interactive";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

type Tab = "weight" | "measurements" | "records" | "photos";

export default function Progress() {
  const [activeTab, setActiveTab] = useState<Tab>("weight");
  const [showLogForm, setShowLogForm] = useState(false);
  const [showPRForm, setShowPRForm] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-display font-bold text-foreground mb-1">Progress</h1>
        <p className="text-muted-foreground text-sm">Track your transformation</p>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-5">
        <div className="flex gap-1 p-1 bg-muted rounded-xl overflow-x-auto">
          {(["weight", "measurements", "records", "photos"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-shrink-0 py-2 px-3 rounded-lg text-xs font-medium capitalize transition-all",
                activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              {tab === "records" ? "PRs" : tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "weight" && <WeightTab onAdd={() => setShowLogForm(true)} />}
      {activeTab === "measurements" && <MeasurementsTab onAdd={() => setShowLogForm(true)} />}
      {activeTab === "records" && <RecordsTab onAdd={() => setShowPRForm(true)} />}
      {activeTab === "photos" && <PhotosTab />}

      {showLogForm && <LogProgressModal onClose={() => setShowLogForm(false)} />}
      {showPRForm && <LogPRModal onClose={() => setShowPRForm(false)} />}
    </div>
  );
}

function PhotosTab() {
  const [selectedAngle, setSelectedAngle] = useState<"front" | "side" | "back">("front");
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="px-5 space-y-5 pb-6">
      {/* Angle selector */}
      <div className="flex gap-2">
        {(["front", "side", "back"] as const).map((angle) => (
          <button
            key={angle}
            onClick={() => setSelectedAngle(angle)}
            className={cn(
              "flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all",
              selectedAngle === angle
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {angle}
          </button>
        ))}
      </div>

      {/* Comparison view */}
      <ComparisonView angle={selectedAngle} />

      {/* Gallery */}
      <PhotoGallery angle={selectedAngle} onUpload={() => setShowUpload(true)} />

      {showUpload && <PhotoUploadModal angle={selectedAngle} onClose={() => setShowUpload(false)} />}
    </div>
  );
}

function ComparisonView({ angle }: { angle: "front" | "side" | "back" }) {
  const { data: pair, isLoading } = trpc.progress.getComparisonPair.useQuery({ angle });

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!pair) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 text-center text-muted-foreground">
        <p className="text-sm">Upload at least 2 photos to see your progress</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Your Transformation</h3>
        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
          {pair.daysDiff} days
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Before */}
        <div className="space-y-2">
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            <img
              src={pair.before.photoUrl}
              alt="Before"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-xs text-muted-foreground">
            <p className="font-medium">Before</p>
            <p>{format(new Date(pair.before.date), "MMM d, yyyy")}</p>
          </div>
        </div>

        {/* After */}
        <div className="space-y-2">
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            <img
              src={pair.after.photoUrl}
              alt="After"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-xs text-muted-foreground">
            <p className="font-medium">After</p>
            <p>{format(new Date(pair.after.date), "MMM d, yyyy")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotoGallery({
  angle,
  onUpload,
}: {
  angle: "front" | "side" | "back";
  onUpload: () => void;
}) {
  const { data: photos, isLoading, refetch } = trpc.progress.getPhotosByAngle.useQuery({ angle });
  const utils = trpc.useUtils();
  const deletePhoto = trpc.progress.deletePhoto.useMutation({
    onSuccess: () => {
      toast.success("Photo deleted");
      utils.progress.getPhotosByAngle.invalidate({ angle });
      utils.progress.getComparisonPair.invalidate({ angle });
      utils.progress.listPhotos.invalidate();
      refetch();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground capitalize">{angle} View</h3>
        <Button size="sm" onClick={onUpload} className="gap-1">
          <Camera className="w-4 h-4" />
          Add Photo
        </Button>
      </div>

      {!photos || photos.length === 0 ? (
        <div className="bg-muted rounded-lg p-8 text-center">
          <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No photos yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                <img
                  src={photo.photoUrl}
                  alt={`${angle} view`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <button
                  onClick={() => deletePhoto.mutate({ photoId: photo.id })}
                  className="p-2 bg-red-500 hover:bg-red-600 rounded-full text-white"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(photo.date), "MMM d")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PhotoUploadModal({
  angle,
  onClose,
}: {
  angle: "front" | "side" | "back";
  onClose: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const uploadPhoto = trpc.progress.uploadPhoto.useMutation({
    onSuccess: () => {
      toast.success("Photo uploaded!");
      utils.progress.getPhotosByAngle.invalidate({ angle });
      utils.progress.getComparisonPair.invalidate({ angle });
      utils.progress.listPhotos.invalidate();
      onClose();
    },
    onError: () => {
      toast.error("Failed to upload photo");
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview) {
      toast.error("Please select a photo");
      return;
    }

    setIsLoading(true);
    const base64 = preview.split(",")[1];
    uploadPhoto.mutate({ photoBase64: base64, angle, notes });
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="w-full bg-background rounded-t-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Upload {angle} Photo</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview */}
        {preview ? (
          <div className="space-y-2">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              Change Photo
            </Button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-square bg-muted rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 hover:bg-muted/80 transition-colors"
          >
            <Camera className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Tap to select photo</p>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Feeling stronger, better pump..."
            className="w-full p-3 bg-muted border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground resize-none h-20"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!preview || isLoading}
            className="flex-1 gap-1"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Existing tabs (weight, measurements, records) ───
function WeightTab({ onAdd }: { onAdd: () => void }) {
  const { data: entries } = trpc.progress.getEntries.useQuery({ limit: 30 });

  const weightData = entries
    ?.filter((e) => e.weightKg)
    .map((e) => ({
      date: e.entryDate.slice(5),
      weight: e.weightKg,
    }))
    .reverse() ?? [];

  const latest = entries?.find((e) => e.weightKg);
  const previous = entries?.filter((e) => e.weightKg)[1];
  const change =
    latest?.weightKg && previous?.weightKg ? latest.weightKg - previous.weightKg : null;

  return (
    <div className="px-5 space-y-5 pb-6">
      {/* Current weight card */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-muted-foreground text-sm mb-1">Current Weight</p>
            <p className="text-3xl font-bold text-foreground">
              {latest?.weightKg?.toFixed(1) ?? "—"} kg
            </p>
          </div>
          <div className="text-right">
            {change !== null && (
              <div
                className={cn(
                  "text-sm font-semibold",
                  change < 0 ? "text-green-500" : "text-red-500"
                )}
              >
                {change > 0 ? "+" : ""}
                {change.toFixed(1)} kg
              </div>
            )}
            <Button size="sm" onClick={onAdd} className="gap-1 mt-2">
              <Plus className="w-4 h-4" />
              Log
            </Button>
          </div>
        </div>
      </div>

      {/* Chart */}
      {weightData.length > 1 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weightData}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorWeight)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function MeasurementsTab({ onAdd }: { onAdd: () => void }) {
  const { data: entries } = trpc.progress.getEntries.useQuery({ limit: 30 });

  const measurements = entries
    ?.filter((e) => e.chestCm || e.waistCm || e.armCm)
    .map((e) => ({
      date: e.entryDate.slice(5),
      chest: e.chestCm,
      waist: e.waistCm,
      arm: e.armCm,
    }))
    .reverse() ?? [];

  return (
    <div className="px-5 space-y-5 pb-6">
      <Button onClick={onAdd} className="w-full gap-1">
        <Plus className="w-4 h-4" />
        Log Measurements
      </Button>

      {measurements.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={measurements}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Line type="monotone" dataKey="chest" stroke="#8b5cf6" name="Chest" />
              <Line type="monotone" dataKey="waist" stroke="#ec4899" name="Waist" />
              <Line type="monotone" dataKey="arm" stroke="#06b6d4" name="Arm" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function RecordsTab({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="px-5 space-y-5 pb-6">
      <Button onClick={onAdd} className="w-full gap-1">
        <Plus className="w-4 h-4" />
        Log PR
      </Button>

      <div className="text-center py-8 text-muted-foreground">
        <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">PRs coming soon</p>
      </div>
    </div>
  );
}

function LogProgressModal({ onClose }: { onClose: () => void }) {
  const [weight, setWeight] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [arm, setArm] = useState("");

  const logProgress = trpc.progress.logEntry.useMutation({
    onSuccess: () => {
      toast.success("Progress logged!");
      onClose();
    },
  });

  const handleSubmit = () => {
    logProgress.mutate({
      entryDate: new Date().toISOString().split('T')[0],
      weightKg: weight ? parseFloat(weight) : undefined,
      chestCm: chest ? parseFloat(chest) : undefined,
      waistCm: waist ? parseFloat(waist) : undefined,
      armCm: arm ? parseFloat(arm) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="w-full bg-background rounded-t-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-foreground">Log Progress</h2>

        <div className="space-y-3">
          <input
            type="number"
            step="0.1"
            placeholder="Weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full p-3 bg-muted border border-border rounded-lg text-foreground"
          />
          <input
            type="number"
            step="0.1"
            placeholder="Chest (cm)"
            value={chest}
            onChange={(e) => setChest(e.target.value)}
            className="w-full p-3 bg-muted border border-border rounded-lg text-foreground"
          />
          <input
            type="number"
            step="0.1"
            placeholder="Waist (cm)"
            value={waist}
            onChange={(e) => setWaist(e.target.value)}
            className="w-full p-3 bg-muted border border-border rounded-lg text-foreground"
          />
          <input
            type="number"
            step="0.1"
            placeholder="Arm (cm)"
            value={arm}
            onChange={(e) => setArm(e.target.value)}
            className="w-full p-3 bg-muted border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Log
          </Button>
        </div>
      </div>
    </div>
  );
}

function LogPRModal({ onClose }: { onClose: () => void }) {
  const [exercise, setExercise] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("kg");

  const handleSubmit = () => {
    toast.success("PR logged!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="w-full bg-background rounded-t-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-foreground">Log Personal Record</h2>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Exercise name"
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
            className="w-full p-3 bg-muted border border-border rounded-lg text-foreground"
          />
          <input
            type="number"
            step="0.5"
            placeholder="Value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full p-3 bg-muted border border-border rounded-lg text-foreground"
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full p-3 bg-muted border border-border rounded-lg text-foreground"
          >
            <option>kg</option>
            <option>lbs</option>
            <option>reps</option>
            <option>time</option>
          </select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Log PR
          </Button>
        </div>
      </div>
    </div>
  );
}
