import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Heart, Plus, X, Clock, Trophy, Zap, AlertTriangle,
  Star, Trash2, RotateCcw, Crown, Lock, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLocation } from "wouter";

/* ═══════════════════════════════════════════════════════════════════════════
   ADDICTION CATALOGUE
   ═══════════════════════════════════════════════════════════════════════════ */
const ADDICTION_CATALOGUE = [
  // Substances
  { type: "alcohol", label: "Alcohol", emoji: "🍺", category: "Substances" },
  { type: "smoking", label: "Smoking / Cigarettes", emoji: "🚬", category: "Substances" },
  { type: "vaping", label: "Vaping / E-cigarettes", emoji: "💨", category: "Substances" },
  { type: "cannabis", label: "Cannabis / Weed", emoji: "🌿", category: "Substances" },
  { type: "cocaine", label: "Cocaine", emoji: "⚪", category: "Substances" },
  { type: "opioids", label: "Opioids / Heroin", emoji: "💊", category: "Substances" },
  { type: "meth", label: "Methamphetamine", emoji: "🔴", category: "Substances" },
  { type: "prescription_drugs", label: "Prescription Drug Abuse", emoji: "💉", category: "Substances" },
  { type: "caffeine", label: "Caffeine / Energy Drinks", emoji: "☕", category: "Substances" },
  { type: "steroids", label: "Anabolic Steroids", emoji: "💪", category: "Substances" },
  // Behavioral
  { type: "gambling", label: "Gambling / Betting", emoji: "🎰", category: "Behavioral" },
  { type: "porn", label: "Pornography", emoji: "🔞", category: "Behavioral" },
  { type: "social_media", label: "Social Media", emoji: "📱", category: "Behavioral" },
  { type: "gaming", label: "Video Games", emoji: "🎮", category: "Behavioral" },
  { type: "shopping", label: "Shopping / Spending", emoji: "🛍️", category: "Behavioral" },
  { type: "food", label: "Binge Eating / Food", emoji: "🍔", category: "Behavioral" },
  { type: "sugar", label: "Sugar / Junk Food", emoji: "🍭", category: "Behavioral" },
  { type: "screens", label: "Screen Addiction / TV", emoji: "📺", category: "Behavioral" },
  { type: "work", label: "Workaholism", emoji: "💼", category: "Behavioral" },
  { type: "exercise", label: "Exercise Addiction", emoji: "🏋️", category: "Behavioral" },
  // Mental / Emotional
  { type: "self_harm", label: "Self-Harm", emoji: "🩹", category: "Mental" },
  { type: "anger", label: "Anger / Rage", emoji: "😡", category: "Mental" },
  { type: "overthinking", label: "Overthinking / Anxiety", emoji: "🧠", category: "Mental" },
  { type: "negative_self_talk", label: "Negative Self-Talk", emoji: "💭", category: "Mental" },
  { type: "procrastination", label: "Procrastination", emoji: "⏰", category: "Mental" },
  // Relationships
  { type: "toxic_relationships", label: "Toxic Relationships", emoji: "💔", category: "Relationships" },
  { type: "codependency", label: "Codependency", emoji: "🔗", category: "Relationships" },
  { type: "love_addiction", label: "Love / Romance Addiction", emoji: "❤️", category: "Relationships" },
  // Other
  { type: "other", label: "Other / Custom", emoji: "✨", category: "Other" },
];

/* ═══════════════════════════════════════════════════════════════════════════
   COPING STRATEGIES
   ═══════════════════════════════════════════════════════════════════════════ */
const COPING_STRATEGIES = [
  "Deep breathing (4-7-8)",
  "Go for a walk or run",
  "Call a trusted friend",
  "Drink a glass of water",
  "Do 10 push-ups",
  "Meditate for 5 minutes",
  "Journal your feelings",
  "Listen to music",
  "Take a cold shower",
  "Delay 15 minutes",
  "Practice gratitude",
  "Watch a motivational video",
];

/* ═══════════════════════════════════════════════════════════════════════════
   DAILY MOTIVATIONS
   ═══════════════════════════════════════════════════════════════════════════ */
const DAILY_MOTIVATIONS = [
  "Every day sober is a victory. You are stronger than your cravings. 💪",
  "The hardest part is already behind you. Keep going. 🔥",
  "You didn't come this far to only come this far. Push through. ⚡",
  "Your future self is cheering you on right now. 🙌",
  "Recovery isn't a straight line — every step forward counts. 🌟",
  "You are not your addiction. You are so much more. ✨",
  "One day at a time. That's all it takes. 🌅",
  "The pain of discipline is nothing compared to the pain of regret. 💎",
  "You are rewriting your story. Make it a great one. 📖",
  "Strength isn't about never falling. It's about always getting back up. 🦁",
  "Your brain is healing. Your life is changing. Trust the process. 🧠",
  "Every urge you resist makes you stronger. You are becoming elite. 🏆",
  "The version of you that never quit is who you're becoming. 🚀",
  "Freedom is on the other side of this craving. Hold on. 🕊️",
  "You chose yourself today. That's the most powerful choice you can make. ❤️",
];

/* ═══════════════════════════════════════════════════════════════════════════
   COMBAT TIPS
   ═══════════════════════════════════════════════════════════════════════════ */
const COMBAT_TIPS: Record<string, string[]> = {
  alcohol: [
    "Identify your triggers (stress, social situations, boredom)",
    "Replace alcohol with sparkling water or mocktails",
    "Tell trusted people about your goal",
    "Avoid keeping alcohol at home",
    "Join AA or a support group",
  ],
  smoking: [
    "Use nicotine replacement therapy (patches, gum)",
    "Keep your hands busy with a stress ball",
    "Avoid smoking triggers (coffee, alcohol)",
    "Set a quit date and stick to it",
    "Download a quit-smoking app for accountability",
  ],
  vaping: [
    "Gradually reduce nicotine levels",
    "Replace the habit with chewing gum or mints",
    "Identify when you vape most (boredom, stress)",
    "Tell friends so they can support you",
    "Use the money saved as motivation",
  ],
  gambling: [
    "Block gambling websites and apps",
    "Give control of finances to a trusted person",
    "Join Gamblers Anonymous",
    "Find alternative excitement (sports, games)",
    "Avoid casinos and betting shops entirely",
  ],
  social_media: [
    "Set screen time limits on your phone",
    "Delete apps from your phone (use desktop only)",
    "Schedule specific times to check social media",
    "Replace scrolling with reading or exercise",
    "Do a 30-day social media detox",
  ],
  gaming: [
    "Set strict time limits (1-2 hours max)",
    "Remove games from your main devices",
    "Replace gaming time with social activities",
    "Find a physical hobby (gym, sports, hiking)",
    "Use app blockers during work/study hours",
  ],
  porn: [
    "Install content blocking software",
    "Identify emotional triggers (loneliness, stress)",
    "Replace the habit with exercise or cold showers",
    "Join accountability communities (NoFap, etc.)",
    "Seek therapy — this is a recognized addiction",
  ],
  food: [
    "Plan meals in advance to avoid impulse eating",
    "Keep healthy snacks accessible",
    "Eat slowly and mindfully",
    "Identify emotional eating triggers",
    "Seek support from a nutritionist or therapist",
  ],
  sugar: [
    "Remove sugary foods from your home",
    "Replace with fruit or dark chocolate",
    "Read food labels for hidden sugars",
    "Stay hydrated — thirst mimics sugar cravings",
    "Gradually reduce, don't go cold turkey",
  ],
  caffeine: [
    "Taper down gradually (reduce by 25% per week)",
    "Replace with herbal tea or decaf",
    "Stay hydrated to reduce withdrawal headaches",
    "Get enough sleep to reduce caffeine dependence",
    "Identify when you rely on caffeine most",
  ],
  self_harm: [
    "Call a crisis helpline immediately if in danger",
    "Use the TIPP skill (Temperature, Intense exercise, Paced breathing, Paired muscle relaxation)",
    "Hold ice cubes instead of harming",
    "Seek professional therapy (DBT is highly effective)",
    "Tell someone you trust about your struggle",
  ],
  default: [
    "Track your urges — awareness is the first step",
    "Find a healthy replacement activity",
    "Build a support network of people who understand",
    "Practice mindfulness and meditation daily",
    "Celebrate every milestone, no matter how small",
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════
   MILESTONES
   ═══════════════════════════════════════════════════════════════════════════ */
const MILESTONES = [
  { days: 1, label: "24 Hours", emoji: "🌱", message: "You made it through the hardest day!" },
  { days: 3, label: "3 Days", emoji: "⚡", message: "Your brain is already starting to heal." },
  { days: 7, label: "1 Week", emoji: "🔥", message: "One week strong. You're proving yourself!" },
  { days: 14, label: "2 Weeks", emoji: "💪", message: "Two weeks of pure willpower." },
  { days: 30, label: "1 Month", emoji: "🏅", message: "One month! A new chapter begins." },
  { days: 60, label: "2 Months", emoji: "⭐", message: "60 days of choosing yourself." },
  { days: 90, label: "3 Months", emoji: "🏆", message: "90 days. You're a different person now." },
  { days: 180, label: "6 Months", emoji: "💎", message: "Half a year of freedom. Incredible." },
  { days: 365, label: "1 Year", emoji: "👑", message: "ONE YEAR. You are a legend." },
  { days: 730, label: "2 Years", emoji: "🌟", message: "Two years. You've transformed your life." },
];

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */
function getSobrietyDuration(startDate: Date) {
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - startDate.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function getDailyMotivation() {
  const idx = new Date().getDate() % DAILY_MOTIVATIONS.length;
  return DAILY_MOTIVATIONS[idx];
}

function getAddictionInfo(type: string) {
  return ADDICTION_CATALOGUE.find((a) => a.type === type) ?? ADDICTION_CATALOGUE[ADDICTION_CATALOGUE.length - 1];
}

function getNextMilestone(days: number) {
  return MILESTONES.find((m) => m.days > days);
}

function getAchievedMilestones(days: number) {
  return MILESTONES.filter((m) => m.days <= days);
}

/* ═══════════════════════════════════════════════════════════════════════════
   SOBRIETY TIMER
   ═══════════════════════════════════════════════════════════════════════════ */
function SobrietyTimer({ startDate, addictionType }: { startDate: Date; addictionType: string }) {
  const [dur, setDur] = useState(getSobrietyDuration(startDate));
  const info = getAddictionInfo(addictionType);
  const nextMilestone = getNextMilestone(dur.days);

  useEffect(() => {
    const id = setInterval(() => setDur(getSobrietyDuration(startDate)), 1000);
    return () => clearInterval(id);
  }, [startDate]);

  return (
    <div className="relative rounded-3xl overflow-hidden bg-card border border-border p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-green-500/5 pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{info.emoji}</span>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Free from</p>
            <p className="font-bold text-foreground">{info.label}</p>
          </div>
        </div>
        <div className="text-center mb-4">
          <div className="text-6xl font-display font-extrabold text-foreground tabular-nums leading-none">
            {dur.days}
          </div>
          <p className="text-muted-foreground text-sm mt-1 font-semibold uppercase tracking-widest">Days Sober</p>
        </div>
        <div className="flex justify-center gap-6 mb-5">
          {[{ v: dur.hours, l: "hrs" }, { v: dur.minutes, l: "min" }, { v: dur.seconds, l: "sec" }].map(({ v, l }) => (
            <div key={l} className="text-center">
              <div className="text-2xl font-bold text-foreground tabular-nums">{String(v).padStart(2, "0")}</div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{l}</p>
            </div>
          ))}
        </div>
        {nextMilestone && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">Next milestone</p>
            <p className="font-bold text-foreground text-sm">
              {nextMilestone.emoji} {nextMilestone.label} — {nextMilestone.days - dur.days} day{nextMilestone.days - dur.days !== 1 ? "s" : ""} away
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════════ */
export default function Recovery() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<"tracker" | "urge" | "tips" | "mindset">("tracker");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUrgeForm, setShowUrgeForm] = useState(false);
  const [showMotivationForm, setShowMotivationForm] = useState(false);
  const [selectedAddictionId, setSelectedAddictionId] = useState<number | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<number | null>(null);

  // Add form state
  const [addType, setAddType] = useState("");
  const [addCategory, setAddCategory] = useState("Substances");
  const [addStartDate, setAddStartDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [addNotes, setAddNotes] = useState("");

  // Urge form state
  const [urgeIntensity, setUrgeIntensity] = useState(5);
  const [urgeTrigger, setUrgeTrigger] = useState("");
  const [urgeCoping, setUrgeCoping] = useState("");

  // Motivation form
  const [newMotivation, setNewMotivation] = useState("");

  // Reminder settings
  const [reminderTime, setReminderTime] = useState("09:00");
  const [showReminderSettings, setShowReminderSettings] = useState(false);

  const utils = trpc.useUtils();

  const { data: premiumData, isLoading: premiumLoading } = trpc.recovery.checkPremium.useQuery();
  const isPremium = premiumData?.isPremium;

  const { data: addictions, isLoading: addictionsLoading } = trpc.recovery.listAddictions.useQuery(
    undefined,
    { enabled: !!isPremium }
  );
  const { data: motivations } = trpc.recovery.listMotivations.useQuery(
    undefined,
    { enabled: !!isPremium }
  );
  const { data: urgeHistory } = trpc.recovery.getUrgeHistory.useQuery(
    { addictionId: selectedAddictionId ?? 0, limit: 10 },
    { enabled: !!isPremium && !!selectedAddictionId }
  );

  const addAddiction = trpc.recovery.addAddiction.useMutation({
    onSuccess: () => {
      utils.recovery.listAddictions.invalidate();
      setShowAddForm(false);
      setAddType("");
      setAddNotes("");
      toast.success("Tracker added! Your journey starts now 💪");
    },
    onError: () => toast.error("Failed to add tracker"),
  });

  const resetSobriety = trpc.recovery.resetSobriety.useMutation({
    onSuccess: () => {
      utils.recovery.listAddictions.invalidate();
      setShowResetConfirm(null);
      toast.success("Sobriety date reset. Every new beginning is a victory. 💙");
    },
  });

  const removeAddiction = trpc.recovery.removeAddiction.useMutation({
    onSuccess: () => {
      utils.recovery.listAddictions.invalidate();
      toast.success("Tracker removed");
    },
  });

  const logUrge = trpc.recovery.logUrge.useMutation({
    onSuccess: () => {
      utils.recovery.getUrgeHistory.invalidate();
      setShowUrgeForm(false);
      setUrgeTrigger("");
      setUrgeCoping("");
      setUrgeIntensity(5);
      toast.success("Urge logged. You're aware — that's strength! ⚡");
    },
  });

  const addMotivation = trpc.recovery.addMotivation.useMutation({
    onSuccess: () => {
      utils.recovery.listMotivations.invalidate();
      setShowMotivationForm(false);
      setNewMotivation("");
      toast.success("Motivation saved! 🌟");
    },
  });

  const deleteMotivation = trpc.recovery.deleteMotivation.useMutation({
    onSuccess: () => utils.recovery.listMotivations.invalidate(),
  });

  const { data: reminderSettings } = trpc.recovery.getSobrietyReminderSettings.useQuery(
    undefined,
    { enabled: !!isPremium }
  );
  const { data: lastCravingAlert } = trpc.recovery.getCravingAlertStatus.useQuery(
    undefined,
    { enabled: !!isPremium }
  );

  const setSobrietyReminderTime = trpc.recovery.setSobrietyReminderTime.useMutation({
    onSuccess: () => {
      utils.recovery.getSobrietyReminderSettings.invalidate();
      toast.success("Reminder time updated!");
      setShowReminderSettings(false);
    },
  });

  const logCravingAlert = trpc.recovery.logCravingAlert.useMutation({
    onSuccess: () => {
      utils.recovery.listAddictions.invalidate();
      utils.recovery.getCravingAlertStatus.invalidate();
      toast.success("Craving alert sent! You've got this 💪");
    },
    onError: () => toast.error("Failed to send craving alert"),
  });

  const dailyMotivation = getDailyMotivation();
  const categories = Array.from(new Set(ADDICTION_CATALOGUE.map((a) => a.category)));

  useEffect(() => {
    if (!isPremium || !addictions?.length) return;

    const query = new URLSearchParams(window.location.search);
    if (query.get("tab") === "tips") {
      setTab("tips");
      return;
    }

    const addictionId = Number(query.get("addUrge"));
    if (addictionId && addictions.some((addiction) => addiction.id === addictionId)) {
      setTab("urge");
      setSelectedAddictionId(addictionId);
      setShowUrgeForm(true);
    }
  }, [addictions, isPremium]);

  /* ─── Premium Gate ─────────────────────────────────────────────────── */
  if (premiumLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-primary/20 animate-pulse flex items-center justify-center">
          <Heart className="text-primary" size={20} />
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-yellow-400/15 flex items-center justify-center mb-6 shadow-[0_0_40px_oklch(0.85_0.18_85/0.2)]">
          <Lock size={36} className="text-yellow-400" />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground mb-3">Premium Feature</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-xs">
          The Addiction Recovery module is a Premium feature. Start your 21-day free trial to unlock it and begin your journey to freedom.
        </p>
        <Button
          className="w-full max-w-xs h-14 rounded-2xl font-bold glow-primary"
          onClick={() => navigate("/premium")}
        >
          <Crown size={18} className="mr-2 text-yellow-400" />
          Start 21-Day Free Trial
        </Button>
        <p className="text-xs text-muted-foreground mt-3">No credit card required</p>
      </div>
    );
  }

  /* ─── Main UI ───────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-background pb-nav">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-display font-bold text-foreground">Recovery</h1>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20">
            <Crown size={12} className="text-yellow-400" />
            <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">Pro</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Your path to freedom, one day at a time</p>
      </div>

      {/* Daily Motivation Banner */}
      <div className="px-5 mb-4">
        <div className="relative rounded-2xl overflow-hidden bg-card border border-primary/20 p-4">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
          <div className="relative flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
              <Star size={14} className="text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Today's Motivation</p>
              <p className="text-sm text-foreground leading-relaxed">{dailyMotivation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-4">
        <div className="flex gap-1 p-1 bg-muted rounded-xl">
          {([
            { id: "tracker", label: "Tracker", icon: Clock },
            { id: "urge", label: "Urge Log", icon: AlertTriangle },
            { id: "tips", label: "Tips", icon: Zap },
            { id: "mindset", label: "Mindset", icon: Heart },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "flex-1 py-2 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1",
                tab === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              <Icon size={11} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TRACKER TAB ── */}
      {tab === "tracker" && (
        <div className="px-5 space-y-4">
          <section className="rounded-2xl bg-card border border-border p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Daily reminder</p>
                <p className="text-xs text-muted-foreground">
                  {reminderSettings?.sobrietyReminder
                    ? `Set for ${reminderSettings.sobrietyReminderTime ?? "09:00"}`
                    : "Currently turned off"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={() => {
                  setReminderTime(reminderSettings?.sobrietyReminderTime ?? "09:00");
                  setShowReminderSettings(true);
                }}
              >
                <Clock size={14} className="mr-1.5" />
                Edit
              </Button>
            </div>
            <div className="pt-3 border-t border-border/70">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Last craving alert</p>
              <p className="text-xs text-foreground">
                {lastCravingAlert?.loggedAt
                  ? new Date(lastCravingAlert.loggedAt).toLocaleString()
                  : "No craving alert sent yet"}
              </p>
            </div>
          </section>

          {addictionsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="h-48 rounded-2xl bg-card border border-border animate-pulse" />)}
            </div>
          ) : !addictions?.length ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Heart size={28} className="text-primary" />
              </div>
              <p className="font-bold text-foreground mb-2">Start Your Recovery Journey</p>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                Track your sobriety from any addiction. Every day counts.
              </p>
              <Button onClick={() => setShowAddForm(true)} className="rounded-xl">
                <Plus size={16} className="mr-2" />
                Add First Tracker
              </Button>
            </div>
          ) : (
            <>
              {addictions.map((addiction) => {
                const startDate = new Date(addiction.sobrietyStartDate);
                const { days } = getSobrietyDuration(startDate);
                const achieved = getAchievedMilestones(days);

                return (
                  <div key={addiction.id} className="space-y-3">
                    <SobrietyTimer startDate={startDate} addictionType={addiction.addictionType} />

                    {achieved.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {achieved.slice(-5).map((m) => (
                          <div key={m.days} className="shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-card border border-border">
                            <span className="text-lg">{m.emoji}</span>
                            <span className="text-[10px] font-semibold text-foreground whitespace-nowrap">{m.label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => logCravingAlert.mutate({ addictionId: addiction.id })}
                        disabled={logCravingAlert.isPending}
                        className="flex-1 min-w-[90px] py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-sm font-semibold text-red-400 flex items-center justify-center gap-2 hover:border-red-500/60 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      >
                        <Zap size={14} />
                        Craving
                      </button>
                      <button
                        onClick={() => { setSelectedAddictionId(addiction.id); setShowUrgeForm(true); }}
                        className="flex-1 min-w-[90px] py-2.5 rounded-xl bg-card border border-border text-sm font-semibold text-foreground flex items-center justify-center gap-2 hover:border-primary/40 transition-colors"
                      >
                        <AlertTriangle size={14} className="text-orange-400" />
                        Urge
                      </button>
                      <button
                        onClick={() => setShowResetConfirm(addiction.id)}
                        className="flex-1 min-w-[90px] py-2.5 rounded-xl bg-card border border-border text-sm font-semibold text-muted-foreground flex items-center justify-center gap-2 hover:border-destructive/40 hover:text-destructive transition-colors"
                      >
                        <RotateCcw size={14} />
                        Reset
                      </button>
                      <button
                        onClick={() => removeAddiction.mutate({ addictionId: addiction.id })}
                        className="w-10 h-10 shrink-0 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {showResetConfirm === addiction.id && (
                      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 space-y-3">
                        <p className="text-sm font-semibold text-foreground">Reset sobriety date?</p>
                        <p className="text-xs text-muted-foreground">
                          This resets your timer to today. Relapse is part of recovery — you're still brave for trying.
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="destructive" className="flex-1 rounded-lg"
                            onClick={() => resetSobriety.mutate({ addictionId: addiction.id, newStartDate: new Date() })}>
                            Reset Timer
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 rounded-lg"
                            onClick={() => setShowResetConfirm(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <Button variant="outline" className="w-full rounded-xl border-dashed" onClick={() => setShowAddForm(true)}>
                <Plus size={16} className="mr-2" />
                Track Another Addiction
              </Button>
            </>
          )}
        </div>
      )}

      {/* ── URGE LOG TAB ── */}
      {tab === "urge" && (
        <div className="px-5 space-y-4">
          <div className="p-4 rounded-2xl bg-card border border-border">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">What is an Urge Log?</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When you feel an urge, log it here. Studies show that simply acknowledging an urge reduces its intensity by up to 40%. You are not your urges.
            </p>
          </div>

          {addictions && addictions.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Select Addiction</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {addictions.map((a) => {
                  const info = getAddictionInfo(a.addictionType);
                  return (
                    <button key={a.id} onClick={() => setSelectedAddictionId(a.id)}
                      className={cn(
                        "shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all",
                        selectedAddictionId === a.id ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground"
                      )}>
                      <span>{info.emoji}</span>{info.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedAddictionId && (
            <Button className="w-full rounded-xl" onClick={() => setShowUrgeForm(true)}>
              <AlertTriangle size={16} className="mr-2" />
              Log an Urge Now
            </Button>
          )}

          {urgeHistory && urgeHistory.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recent Urges</p>
              {urgeHistory.map((urge) => (
                <div key={urge.id} className="p-3.5 rounded-xl bg-card border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full",
                        urge.intensity >= 8 ? "bg-red-500" : urge.intensity >= 5 ? "bg-orange-400" : "bg-green-400")} />
                      <span className="text-sm font-semibold text-foreground">Intensity: {urge.intensity}/10</span>
                    </div>
                    {urge.overcame && (
                      <div className="flex items-center gap-1 text-green-400 text-xs font-semibold">
                        <CheckCircle2 size={12} />Overcame
                      </div>
                    )}
                  </div>
                  {urge.trigger && <p className="text-xs text-muted-foreground">Trigger: {urge.trigger}</p>}
                  {urge.copingStrategy && <p className="text-xs text-muted-foreground">Used: {urge.copingStrategy}</p>}
                  <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(urge.loggedAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}

          {!addictions?.length && (
            <div className="text-center py-10">
              <p className="text-muted-foreground text-sm">Add an addiction tracker first to log urges.</p>
            </div>
          )}
        </div>
      )}

      {/* ── TIPS TAB ── */}
      {tab === "tips" && (
        <div className="px-5 space-y-4">
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
            <p className="text-sm font-semibold text-foreground mb-1">Science-backed strategies</p>
            <p className="text-xs text-muted-foreground">These techniques are used in clinical addiction recovery programs worldwide.</p>
          </div>

          {addictions?.map((addiction) => {
            const info = getAddictionInfo(addiction.addictionType);
            const tips = COMBAT_TIPS[addiction.addictionType] ?? COMBAT_TIPS.default;
            return (
              <div key={addiction.id} className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <span>{info.emoji}</span>{info.label}
                </p>
                <div className="space-y-2">
                  {tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Universal Coping Strategies</p>
            <div className="grid grid-cols-2 gap-2">
              {COPING_STRATEGIES.map((strategy) => (
                <div key={strategy} className="p-3 rounded-xl bg-card border border-border">
                  <p className="text-xs text-foreground leading-snug">{strategy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MINDSET TAB ── */}
      {tab === "mindset" && (
        <div className="px-5 space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-card border border-primary/30 p-5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
            <div className="relative">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Daily Motivation</p>
              <p className="text-base font-semibold text-foreground leading-relaxed">{dailyMotivation}</p>
              <p className="text-[10px] text-muted-foreground mt-3">Updates every day at midnight</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Motivation Library</p>
            {DAILY_MOTIVATIONS.map((msg, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-card border border-border">
                <p className="text-sm text-foreground leading-relaxed">{msg}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Your Custom Motivations</p>
              <button onClick={() => setShowMotivationForm(true)} className="flex items-center gap-1 text-xs font-semibold text-primary">
                <Plus size={12} />Add
              </button>
            </div>
            {!motivations?.length && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Write your own motivations — words that resonate with you personally.
              </p>
            )}
            {motivations?.map((m) => (
              <div key={m.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-card border border-border">
                <p className="text-sm text-foreground leading-relaxed flex-1">{m.message}</p>
                <button onClick={() => deleteMotivation.mutate({ motivationId: m.id })}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ REMINDER SETTINGS ══ */}
      {showReminderSettings && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-display font-bold text-foreground">Daily reminder</h2>
                <p className="text-xs text-muted-foreground mt-1">Choose when you want your recovery check-in.</p>
              </div>
              <button onClick={() => setShowReminderSettings(false)} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center" aria-label="Close reminder settings">
                <X size={16} />
              </button>
            </div>
            <label className="block space-y-2">
              <span className="text-xs font-semibold text-muted-foreground">Reminder time</span>
              <input
                type="time"
                value={reminderTime}
                onChange={(event) => setReminderTime(event.target.value)}
                className="w-full h-12 rounded-xl bg-muted border border-border px-3 text-foreground outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="rounded-xl" onClick={() => setShowReminderSettings(false)}>Cancel</Button>
              <Button
                className="rounded-xl"
                disabled={setSobrietyReminderTime.isPending}
                onClick={() => setSobrietyReminderTime.mutate({ time: reminderTime, enabled: true })}
              >
                Save reminder
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══ ADD ADDICTION FORM ══ */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-screen px-5 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-foreground">Add Recovery Tracker</h2>
              <button onClick={() => setShowAddForm(false)} className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center">
                <X size={16} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Category</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setAddCategory(cat)}
                    className={cn(
                      "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
                      addCategory === cat ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border text-muted-foreground"
                    )}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Select Addiction</p>
              <div className="grid grid-cols-2 gap-2">
                {ADDICTION_CATALOGUE.filter((a) => a.category === addCategory).map((addiction) => (
                  <button key={addiction.type} onClick={() => setAddType(addiction.type)}
                    className={cn(
                      "flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all",
                      addType === addiction.type ? "border-primary bg-primary/10" : "border-border bg-card"
                    )}>
                    <span className="text-xl">{addiction.emoji}</span>
                    <span className="text-xs font-semibold text-foreground leading-tight">{addiction.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Sobriety Start Date</label>
              <input type="datetime-local" value={addStartDate} onChange={(e) => setAddStartDate(e.target.value)}
                className="w-full h-12 px-4 bg-card border border-border rounded-xl text-foreground focus:border-primary outline-none transition-all" />
            </div>

            <div className="mb-6">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Personal Note (optional)</label>
              <textarea value={addNotes} onChange={(e) => setAddNotes(e.target.value)}
                placeholder="Why are you doing this? What's your reason?" rows={3}
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:border-primary outline-none transition-all resize-none" />
            </div>

            <Button className="w-full h-14 rounded-2xl font-bold"
              disabled={!addType || addAddiction.isPending}
              onClick={() => {
                if (!addType) return;
                const info = getAddictionInfo(addType);
                addAddiction.mutate({
                  addictionType: addType,
                  addictionLabel: info.label,
                  sobrietyStartDate: new Date(addStartDate),
                  notes: addNotes || undefined,
                });
              }}>
              {addAddiction.isPending ? "Adding..." : "Start Tracking 💪"}
            </Button>
          </div>
        </div>
      )}

      {/* ══ LOG URGE FORM ══ */}
      {showUrgeForm && selectedAddictionId && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-screen px-5 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-foreground">Log an Urge</h2>
              <button onClick={() => setShowUrgeForm(false)} className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center">
                <X size={16} />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-5">
              <p className="text-sm text-foreground font-semibold">You're doing the right thing.</p>
              <p className="text-xs text-muted-foreground mt-1">Logging an urge instead of acting on it is a win. You're in control.</p>
            </div>

            <div className="mb-5">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 block">
                Urge Intensity: {urgeIntensity}/10
              </label>
              <input type="range" min={1} max={10} value={urgeIntensity}
                onChange={(e) => setUrgeIntensity(Number(e.target.value))}
                className="w-full accent-primary" />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>Mild</span><span>Moderate</span><span>Intense</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">What triggered this urge?</label>
              <input type="text" value={urgeTrigger} onChange={(e) => setUrgeTrigger(e.target.value)}
                placeholder="e.g. stress, boredom, social situation..."
                className="w-full h-12 px-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:border-primary outline-none transition-all" />
            </div>

            <div className="mb-6">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Coping strategy used</label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {COPING_STRATEGIES.slice(0, 6).map((strategy) => (
                  <button key={strategy} onClick={() => setUrgeCoping(strategy)}
                    className={cn(
                      "p-2.5 rounded-lg border text-xs text-left transition-all",
                      urgeCoping === strategy ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground"
                    )}>
                    {strategy}
                  </button>
                ))}
              </div>
              <input type="text" value={urgeCoping} onChange={(e) => setUrgeCoping(e.target.value)}
                placeholder="Or describe your own strategy..."
                className="w-full h-10 px-3 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary outline-none transition-all" />
            </div>

            <Button className="w-full h-14 rounded-2xl font-bold"
              onClick={() => logUrge.mutate({ addictionId: selectedAddictionId, intensity: urgeIntensity, trigger: urgeTrigger || undefined, copingStrategy: urgeCoping || undefined, overcame: true })}
              disabled={logUrge.isPending}>
              {logUrge.isPending ? "Logging..." : "I Overcame This Urge 💪"}
            </Button>
          </div>
        </div>
      )}

      {/* ══ ADD MOTIVATION FORM ══ */}
      {showMotivationForm && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end">
          <div className="w-full bg-card rounded-t-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground">Add Custom Motivation</h3>
              <button onClick={() => setShowMotivationForm(false)}>
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>
            <textarea value={newMotivation} onChange={(e) => setNewMotivation(e.target.value)}
              placeholder="Write something that motivates you personally..." rows={4}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:border-primary outline-none transition-all resize-none" />
            <Button className="w-full rounded-xl"
              disabled={!newMotivation.trim() || addMotivation.isPending}
              onClick={() => addMotivation.mutate({ message: newMotivation.trim() })}>
              Save Motivation
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
