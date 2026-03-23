import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Trophy, Loader2, X } from "lucide-react";
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

type Tab = "weight" | "measurements" | "records";

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
        <div className="flex gap-1 p-1 bg-muted rounded-xl">
          {(["weight", "measurements", "records"] as Tab[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn("flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all",
                activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
              {tab === "records" ? "PRs" : tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "weight" && <WeightTab onAdd={() => setShowLogForm(true)} />}
      {activeTab === "measurements" && <MeasurementsTab onAdd={() => setShowLogForm(true)} />}
      {activeTab === "records" && <RecordsTab onAdd={() => setShowPRForm(true)} />}

      {showLogForm && <LogProgressModal onClose={() => setShowLogForm(false)} />}
      {showPRForm && <LogPRModal onClose={() => setShowPRForm(false)} />}
    </div>
  );
}

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
  const change = latest?.weightKg && previous?.weightKg
    ? latest.weightKg - previous.weightKg
    : null;

  return (
    <div className="px-5 space-y-5 pb-6">
      {/* Current weight card */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-muted-foreground text-sm mb-1">Current Weight</p>
            <p className="text-4xl font-display font-bold text-foreground">
              {latest?.weightKg?.toFixed(1) ?? "--"}<span className="text-xl text-muted-foreground ml-1">kg</span>
            </p>
          </div>
          {change !== null && (
            <div className={cn("flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-semibold",
              change < 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
              {change < 0 ? "↓" : "↑"} {Math.abs(change).toFixed(1)}kg
            </div>
          )}
        </div>

        {weightData.length > 1 ? (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={weightData}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--vyro-violet, #8b5cf6)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--vyro-violet, #8b5cf6)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={35} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px" }}
                labelStyle={{ color: "var(--muted-foreground)" }}
                itemStyle={{ color: "var(--foreground)" }}
              />
              <Area type="monotone" dataKey="weight" stroke="var(--vyro-violet, #8b5cf6)" strokeWidth={2} fill="url(#weightGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
            Log more entries to see your chart
          </div>
        )}
      </div>

      <Button className="w-full h-12 rounded-2xl" onClick={onAdd}>
        <Plus size={16} className="mr-2" />Log Today's Weight
      </Button>

      {/* History */}
      {entries && entries.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-3">History</h3>
          <div className="space-y-2">
            {entries.filter((e) => e.weightKg).slice(0, 10).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-xl">
                <span className="text-sm text-muted-foreground">{entry.entryDate}</span>
                <span className="font-semibold text-foreground">{entry.weightKg?.toFixed(1)} kg</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MeasurementsTab({ onAdd }: { onAdd: () => void }) {
  const { data: entries } = trpc.progress.getEntries.useQuery({ limit: 10 });
  const latest = entries?.[0];

  const measurements = [
    { key: "chestCm", label: "Chest", value: latest?.chestCm },
    { key: "waistCm", label: "Waist", value: latest?.waistCm },
    { key: "hipsCm", label: "Hips", value: latest?.hipsCm },
    { key: "armCm", label: "Arms", value: latest?.armCm },
    { key: "thighCm", label: "Thighs", value: latest?.thighCm },
    { key: "bodyFatPct", label: "Body Fat", value: latest?.bodyFatPct, unit: "%" },
  ];

  return (
    <div className="px-5 space-y-5 pb-6">
      <div className="grid grid-cols-2 gap-3">
        {measurements.map(({ key, label, value, unit = "cm" }) => (
          <div key={key} className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-display font-bold text-foreground">
              {value?.toFixed(1) ?? "--"}
              <span className="text-sm text-muted-foreground ml-1">{unit}</span>
            </p>
          </div>
        ))}
      </div>
      <Button className="w-full h-12 rounded-2xl" onClick={onAdd}>
        <Plus size={16} className="mr-2" />Log Measurements
      </Button>
    </div>
  );
}

function RecordsTab({ onAdd }: { onAdd: () => void }) {
  const { data: records } = trpc.progress.getRecords.useQuery();

  return (
    <div className="px-5 space-y-5 pb-6">
      <Button className="w-full h-12 rounded-2xl" onClick={onAdd}>
        <Trophy size={16} className="mr-2" />Log Personal Record
      </Button>

      {!records?.length ? (
        <div className="flex flex-col items-center py-12 text-center">
          <Trophy size={48} className="text-muted-foreground/30 mb-4" />
          <p className="font-semibold text-foreground">No records yet</p>
          <p className="text-sm text-muted-foreground">Log your first PR to start tracking</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((record) => (
            <div key={record.id} className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center">
                <Trophy size={18} className="text-yellow-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-foreground">{record.exerciseName}</p>
                <p className="text-xs text-muted-foreground">{record.recordDate}</p>
              </div>
              <p className="font-display font-bold text-foreground">{record.value}<span className="text-sm text-muted-foreground ml-1">{record.unit}</span></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LogProgressModal({ onClose }: { onClose: () => void }) {
  const utils = trpc.useUtils();
  const today = format(new Date(), "yyyy-MM-dd");
  const [form, setForm] = useState({
    weightKg: "", bodyFatPct: "", chestCm: "", waistCm: "", hipsCm: "", armCm: "", thighCm: "", notes: "",
  });

  const logEntry = trpc.progress.logEntry.useMutation({
    onSuccess: () => { utils.progress.getEntries.invalidate(); onClose(); toast.success("Progress logged! +20 XP"); },
  });

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end max-w-[430px] mx-auto">
      <div className="w-full bg-card border-t border-border rounded-t-3xl p-6 animate-slide-up max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-lg">Log Progress</h3>
          <button onClick={onClose}><X size={20} className="text-muted-foreground" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { key: "weightKg", label: "Weight (kg)" },
            { key: "bodyFatPct", label: "Body Fat (%)" },
            { key: "chestCm", label: "Chest (cm)" },
            { key: "waistCm", label: "Waist (cm)" },
            { key: "hipsCm", label: "Hips (cm)" },
            { key: "armCm", label: "Arms (cm)" },
            { key: "thighCm", label: "Thighs (cm)" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
              <input type="number" placeholder="0" value={(form as any)[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full h-11 px-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
            </div>
          ))}
        </div>
        <textarea placeholder="Notes (optional)" value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          className="w-full p-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none mb-4" rows={2} />
        <Button className="w-full h-12 rounded-xl glow-primary" onClick={() => logEntry.mutate({ entryDate: today, ...Object.fromEntries(Object.entries(form).filter(([, v]) => v).map(([k, v]) => [k, k === "notes" ? v : parseFloat(v)])) as any })} disabled={logEntry.isPending}>
          {logEntry.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <TrendingUp size={16} className="mr-2" />}
          Save Entry
        </Button>
      </div>
    </div>
  );
}

function LogPRModal({ onClose }: { onClose: () => void }) {
  const utils = trpc.useUtils();
  const today = format(new Date(), "yyyy-MM-dd");
  const [exercise, setExercise] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("kg");

  const [showConfetti, setShowConfetti] = useState(false);

  const setRecord = trpc.progress.setRecord.useMutation({
    onSuccess: () => {
      utils.progress.getRecords.invalidate();
      setShowConfetti(true);
      toast.success("New PR! +100 XP 🏆");
      setTimeout(() => { setShowConfetti(false); onClose(); }, 1200);
    },
  });

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end max-w-[430px] mx-auto">
      <div className="relative w-full bg-card border-t border-border rounded-t-3xl p-6 animate-slide-up">
        <ConfettiEffect active={showConfetti} count={50} />
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-lg">New Personal Record</h3>
          <button onClick={onClose}><X size={20} className="text-muted-foreground" /></button>
        </div>
        <div className="space-y-3 mb-4">
          <input placeholder="Exercise name (e.g. Bench Press)" value={exercise}
            onChange={(e) => setExercise(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <div className="flex gap-3">
            <input type="number" placeholder="Value" value={value}
              onChange={(e) => setValue(e.target.value)}
              className="flex-1 h-12 px-4 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <div className="flex gap-1">
              {["kg", "lbs", "km", "min"].map((u) => (
                <button key={u} onClick={() => setUnit(u)}
                  className={cn("px-3 h-12 rounded-xl text-sm font-medium border transition-all",
                    unit === u ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground")}>
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>
        <Button className="w-full h-12 rounded-xl glow-primary" onClick={() => setRecord.mutate({ exerciseName: exercise, value: parseFloat(value), unit, recordDate: today })} disabled={!exercise || !value || setRecord.isPending}>
          {setRecord.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Trophy size={16} className="mr-2" />}
          Save PR
        </Button>
      </div>
    </div>
  );
}
