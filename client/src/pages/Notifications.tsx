import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import {
  Bell, BellOff, ChevronLeft, Dumbbell, CheckSquare,
  Flame, Trophy, Star, Calendar, Zap, Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ─── Toggle Row ─────────────────────────────────────────────────────────── */
function ToggleRow({
  icon,
  color,
  title,
  subtitle,
  checked,
  onChange,
  disabled,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  subtitle?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-2xl transition-all duration-200",
        disabled ? "opacity-50" : "hover:bg-white/5"
      )}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}20`, color }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {/* Toggle switch */}
      <button
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0",
          checked ? "bg-primary" : "bg-muted"
        )}
        style={{
          boxShadow: checked ? "0 0 12px var(--vyro-glow)" : "none",
        }}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300"
          style={{ left: checked ? "calc(100% - 22px)" : "2px" }}
        />
      </button>
    </div>
  );
}

/* ─── Permission Banner ──────────────────────────────────────────────────── */
function PermissionBanner({
  state,
  onEnable,
  isLoading,
}: {
  state: "default" | "granted" | "denied" | "unsupported";
  onEnable: () => void;
  isLoading: boolean;
}) {
  if (state === "granted") return null;

  if (state === "unsupported") {
    return (
      <div className="mx-4 mb-4 p-4 rounded-2xl bg-muted/60 border border-border/40">
        <div className="flex items-center gap-3">
          <BellOff size={20} className="text-muted-foreground" />
          <div>
            <p className="text-sm font-semibold">Push notifications not supported</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your browser doesn't support push notifications. Try Chrome or Safari on iOS 16.4+.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="mx-4 mb-4 p-4 rounded-2xl bg-destructive/10 border border-destructive/30">
        <div className="flex items-center gap-3">
          <BellOff size={20} className="text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">Notifications blocked</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enable notifications in your browser settings to receive reminders.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default state — show enable prompt
  return (
    <div
      className="mx-4 mb-4 p-4 rounded-2xl border overflow-hidden relative"
      style={{
        background: "linear-gradient(135deg, oklch(0.67 0.24 290 / 0.15), oklch(0.72 0.22 340 / 0.1))",
        borderColor: "oklch(0.67 0.24 290 / 0.3)",
      }}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 0%, oklch(0.67 0.24 290 / 0.2) 0%, transparent 70%)",
        }}
      />
      <div className="relative flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "oklch(0.67 0.24 290 / 0.2)", color: "oklch(0.67 0.24 290)" }}
        >
          <Bell size={20} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold">Enable Push Notifications</p>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">
            Get daily workout reminders, habit check-ins, and streak alerts to stay on track.
          </p>
          <button
            onClick={onEnable}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, oklch(0.67 0.24 290), oklch(0.72 0.22 340))",
              boxShadow: "0 4px 16px oklch(0.67 0.24 290 / 0.4)",
            }}
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Bell size={14} />
            )}
            {isLoading ? "Enabling..." : "Enable Notifications 🔔"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function Notifications() {
  const [, navigate] = useLocation();
  const { permissionState, isSubscribed, isSubscribing, subscribe, unsubscribe } = usePushNotifications();
  const [localSettings, setLocalSettings] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  const { data: settings, refetch } = trpc.notifications.getSettings.useQuery();

  // Sync settings into local state when loaded
  useEffect(() => {
    if (settings) {
      setLocalSettings({
        workoutReminder: settings.workoutReminder,
        habitReminder: settings.habitReminder,
        streakAlert: settings.streakAlert,
        levelUpAlert: settings.levelUpAlert,
        achievementAlert: settings.achievementAlert,
        weeklySummary: settings.weeklySummary,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!settings]);

  const updateSettingsMutation = trpc.notifications.updateSettings.useMutation();
  const sendTestMutation = trpc.notifications.sendTest.useMutation();

  const handleToggle = async (key: string, value: boolean) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
    setIsSaving(true);
    try {
      await updateSettingsMutation.mutateAsync({ [key]: value });
      await refetch();
    } catch {
      // Revert on error
      setLocalSettings((prev) => ({ ...prev, [key]: !value }));
      toast.error("Failed to save setting");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnable = async () => {
    const success = await subscribe();
    if (success) {
      toast.success("🔔 Notifications enabled! You'll get daily reminders.");
    } else {
      toast.error("Couldn't enable notifications. Please check your browser settings.");
    }
  };

  const handleDisable = async () => {
    const success = await unsubscribe();
    if (success) {
      toast.success("Notifications disabled");
    }
  };

  const handleSendTest = async () => {
    try {
      await sendTestMutation.mutateAsync();
      toast.success("Test notification sent! Check your device.");
    } catch {
      toast.error("Failed to send test notification");
    }
  };

  const getToggleValue = (key: string, defaultVal: boolean) => {
    return key in localSettings ? localSettings[key] : (settings?.[key as keyof typeof settings] as boolean ?? defaultVal);
  };

  const notificationsEnabled = permissionState === "granted" && isSubscribed;

  return (
    <div className="min-h-screen bg-background pb-nav">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl border-b border-border/20 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1 as unknown as string)}
            className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors press-scale"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="font-display font-bold text-lg">Notifications</h1>
            <p className="text-xs text-muted-foreground">Stay on track with smart reminders</p>
          </div>
        </div>
      </div>

      <div className="pt-4 space-y-4">
        {/* Permission banner */}
        <PermissionBanner
          state={permissionState}
          onEnable={handleEnable}
          isLoading={isSubscribing}
        />

        {/* Subscription status */}
        {permissionState === "granted" && (
          <div className="mx-4">
            <div
              className={cn(
                "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                notificationsEnabled
                  ? "border-primary/30 bg-primary/10"
                  : "border-border/40 bg-muted/40"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    notificationsEnabled ? "bg-primary/20" : "bg-muted"
                  )}
                  style={{ color: notificationsEnabled ? "var(--primary)" : "var(--muted-foreground)" }}
                >
                  {notificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                </div>
                <div>
                  <p className="text-sm font-bold">
                    {notificationsEnabled ? "Notifications Active" : "Notifications Inactive"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {notificationsEnabled ? "You'll receive daily reminders" : "Subscribe to enable reminders"}
                  </p>
                </div>
              </div>
              {notificationsEnabled ? (
                <button
                  onClick={handleDisable}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors px-3 py-1.5 rounded-xl hover:bg-destructive/10"
                >
                  Disable
                </button>
              ) : (
                <button
                  onClick={handleEnable}
                  disabled={isSubscribing}
                  className="text-xs font-bold text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20"
                >
                  Enable
                </button>
              )}
            </div>
          </div>
        )}

        {/* Daily Reminders */}
        <div className="mx-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">
            Daily Reminders
          </p>
          <div className="card-raised overflow-hidden">
            <ToggleRow
              icon={<Dumbbell size={18} />}
              color="oklch(0.60 0.22 240)"
              title="Workout Reminder"
              subtitle="Daily reminder to complete your workout (9:00 AM)"
              checked={getToggleValue("workoutReminder", true)}
              onChange={(v) => handleToggle("workoutReminder", v)}
              disabled={!notificationsEnabled || isSaving}
            />
            <div className="h-px bg-border/30 mx-4" />
            <ToggleRow
              icon={<CheckSquare size={18} />}
              color="oklch(0.72 0.2 145)"
              title="Habit Check-in"
              subtitle="Evening reminder to complete your habits (8:00 PM)"
              checked={getToggleValue("habitReminder", true)}
              onChange={(v) => handleToggle("habitReminder", v)}
              disabled={!notificationsEnabled || isSaving}
            />
            <div className="h-px bg-border/30 mx-4" />
            <ToggleRow
              icon={<Flame size={18} />}
              color="oklch(0.75 0.2 55)"
              title="Streak Alert"
              subtitle="Alert when your streak is in danger (9:00 PM)"
              checked={getToggleValue("streakAlert", true)}
              onChange={(v) => handleToggle("streakAlert", v)}
              disabled={!notificationsEnabled || isSaving}
            />
          </div>
        </div>

        {/* Achievement Notifications */}
        <div className="mx-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">
            Achievements
          </p>
          <div className="card-raised overflow-hidden">
            <ToggleRow
              icon={<Zap size={18} />}
              color="oklch(0.67 0.24 290)"
              title="Level Up Alerts"
              subtitle="Celebrate when you reach a new level"
              checked={getToggleValue("levelUpAlert", true)}
              onChange={(v) => handleToggle("levelUpAlert", v)}
              disabled={!notificationsEnabled || isSaving}
            />
            <div className="h-px bg-border/30 mx-4" />
            <ToggleRow
              icon={<Trophy size={18} />}
              color="oklch(0.80 0.2 85)"
              title="Achievement Unlocked"
              subtitle="Get notified when you unlock new achievements"
              checked={getToggleValue("achievementAlert", true)}
              onChange={(v) => handleToggle("achievementAlert", v)}
              disabled={!notificationsEnabled || isSaving}
            />
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="mx-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">
            Reports
          </p>
          <div className="card-raised overflow-hidden">
            <ToggleRow
              icon={<Calendar size={18} />}
              color="oklch(0.72 0.18 200)"
              title="Weekly Summary"
              subtitle="Your weekly performance recap every Sunday"
              checked={getToggleValue("weeklySummary", true)}
              onChange={(v) => handleToggle("weeklySummary", v)}
              disabled={!notificationsEnabled || isSaving}
            />
          </div>
        </div>

        {/* Test notification */}
        {notificationsEnabled && (
          <div className="mx-4">
            <button
              onClick={handleSendTest}
              disabled={sendTestMutation.isPending}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-border/40 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all duration-200 press-scale"
            >
              {sendTestMutation.isPending ? (
                <span className="w-4 h-4 border-2 border-muted-foreground/40 border-t-muted-foreground rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Send Test Notification
            </button>
          </div>
        )}

        {/* Info */}
        <div className="mx-4 pb-4">
          <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/30">
            <Star size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Notifications are sent directly to your device. You can disable them anytime from your browser or device settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
