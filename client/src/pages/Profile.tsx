import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Settings, Trophy, Dumbbell, Flame, TrendingUp, Star, ChevronRight, LogOut, Crown, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import GamificationDashboard from "@/components/GamificationDashboard";

const GOAL_LABELS: Record<string, string> = {
  fat_loss: "Fat Loss", lean_bulk: "Lean Bulk", muscle_gain: "Muscle Gain",
  athlete_performance: "Performance", general_fitness: "General Fitness",
};

const LEVEL_TITLES: Record<number, string> = {
  1: "Rookie", 2: "Trainee", 3: "Athlete", 4: "Competitor", 5: "Champion",
  6: "Elite", 7: "Master", 8: "Legend", 9: "Titan", 10: "God Mode",
};

function getLevelTitle(level: number) {
  if (level >= 10) return "God Mode";
  return LEVEL_TITLES[level] || `Level ${level}`;
}

function getAvatarInitials(name?: string | null, email?: string | null) {
  const nameInitials = name
    ?.trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  if (nameInitials) return nameInitials;

  const emailInitial = email?.trim().charAt(0).toUpperCase();
  return emailInitial || "V";
}

type ProfileTab = "fitness" | "gamification";

export default function Profile() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<ProfileTab>("fitness");
  const { data: profile } = trpc.profile.get.useQuery();
  const { data: stats } = trpc.gamification.getStats.useQuery();
  const { data: achievements } = trpc.gamification.getAchievements.useQuery();
  const utils = trpc.useUtils();
  const [uploading, setUploading] = useState(false);
  const uploadAvatar = trpc.profile.uploadAvatar.useMutation();

  const level = stats?.level ?? 1;
  const xp = stats?.xp ?? 0;
  const xpForLevel = (l: number) => l * l * 100;
  const currentLevelXP = xpForLevel(level - 1);
  const nextLevelXP = xpForLevel(level);
  const progress = Math.min(100, ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);

  const initials = getAvatarInitials(user?.name, user?.email);

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!acceptedTypes.includes(file.type)) {
      toast.error("Choose a JPG, PNG, or WebP image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile pictures must be 5 MB or smaller");
      return;
    }

    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Unable to read image"));
        reader.readAsDataURL(file);
      });
      const imageBase64 = dataUrl.split(",")[1];
      if (!imageBase64) throw new Error("Unable to read image");

      await uploadAvatar.mutateAsync({
        imageBase64,
        mimeType: file.type as "image/jpeg" | "image/png" | "image/webp",
      });
      await utils.profile.get.invalidate();
      toast.success("Profile picture updated!");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload profile picture");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">Profile</h1>
        <button onClick={() => navigate("/settings")} className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center">
          <Settings size={18} className="text-muted-foreground" />
        </button>
      </div>

      {/* Profile card */}
      <div className="px-5 mb-5">
        <div className="bg-card border border-border rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex items-center gap-4 mb-4">
            {/* Profile picture with upload */}
            <div className="relative group">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Profile"
                  className="w-16 h-16 rounded-2xl object-cover"
                />
              ) : (
                <div aria-label={`${user?.name || "VYRO athlete"} initials`} className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <span className="text-2xl font-display font-bold text-primary">{initials}</span>
                </div>
              )}
              <label aria-label="Upload profile picture" className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Upload size={20} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePictureUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-display font-bold text-foreground">{user?.name || "Athlete"}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Star size={12} className="text-yellow-400" fill="currentColor" />
                <span className="text-xs font-semibold text-foreground">{getLevelTitle(level)}</span>
                <span className="text-xs text-muted-foreground">· Level {level}</span>
              </div>
            </div>
          </div>

          {/* XP bar */}
          <div className="mb-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">{xp.toLocaleString()} XP</span>
              <span className="text-muted-foreground">Level {level + 1} at {nextLevelXP.toLocaleString()} XP</span>
            </div>
            <div className="xp-bar">
              <div className="xp-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-5">
        <div className="flex gap-1 p-1 bg-muted rounded-xl">
          {(["fitness", "gamification"] as ProfileTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-xs font-medium capitalize transition-all",
                activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              {tab === "gamification" ? "Gamification" : "Fitness Profile"}
            </button>
          ))}
        </div>
      </div>

      {/* Gamification Tab */}
      {activeTab === "gamification" && (
        <div className="px-5 mb-5">
          <GamificationDashboard />
        </div>
      )}

      {/* Fitness Profile Tab */}
      {activeTab === "fitness" && (
        <>
          {/* Stats */}
          <div className="px-5 mb-5">
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Workouts", value: stats?.totalWorkouts ?? 0, icon: Dumbbell, color: "text-purple-400" },
                { label: "Streak", value: stats?.workoutStreak ?? 0, icon: Flame, color: "text-orange-400" },
                { label: "Minutes", value: stats?.totalMinutes ?? 0, icon: TrendingUp, color: "text-blue-400" },
                { label: "Badges", value: achievements?.length ?? 0, icon: Trophy, color: "text-yellow-400" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-card border border-border rounded-xl p-3 text-center">
                  <Icon size={16} className={cn("mx-auto mb-1", color)} />
                  <p className="text-base font-display font-bold text-foreground">{value}</p>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Profile details */}
          <div className="px-5 mb-5">
            <h3 className="font-semibold text-sm mb-3">Fitness Profile</h3>
            <div className="bg-card border border-border rounded-2xl divide-y divide-border">
              {[
                { label: "Goal", value: GOAL_LABELS[profile?.primaryGoal || ""] || "Not set" },
                { label: "Level", value: profile?.fitnessLevel ? profile.fitnessLevel.charAt(0).toUpperCase() + profile.fitnessLevel.slice(1) : "Not set" },
                { label: "Sport", value: profile?.athleteType ? profile.athleteType.replace(/_/g, " ") : "Not set" },
                { label: "Weight", value: profile?.weightKg ? `${profile.weightKg} kg` : "Not set" },
                { label: "Height", value: profile?.heightCm ? `${profile.heightCm} cm` : "Not set" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium text-foreground capitalize">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent badges */}
          {achievements && achievements.length > 0 && (
            <div className="px-5 mb-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Recent Badges</h3>
                <button onClick={() => navigate("/gamification")} className="text-primary text-xs font-medium">
                  See all
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {achievements.slice(0, 8).map((badge) => (
                  <div key={badge.id} className="shrink-0 flex flex-col items-center gap-1.5 p-3 bg-card border border-border rounded-2xl min-w-[70px]">
                    <span className="text-2xl">{badge.badgeIcon}</span>
                    <p className="text-[10px] text-muted-foreground text-center">{badge.badgeName}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Menu */}
      <div className="px-5 mb-5">
        <div className="bg-card border border-border rounded-2xl divide-y divide-border">
          {[
            { label: "Settings", icon: Settings, action: () => navigate("/settings") },
            { label: "Premium", icon: Crown, action: () => navigate("/premium"), highlight: true },
          ].map(({ label, icon: Icon, action, highlight }) => (
            <button key={label} onClick={action}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
              <Icon size={18} className={highlight ? "text-yellow-400" : "text-muted-foreground"} />
              <span className={cn("flex-1 text-sm font-medium", highlight ? "text-yellow-400" : "text-foreground")}>{label}</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="px-5 mb-10">
        <Button variant="outline" className="w-full h-12 rounded-2xl text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={() => logout()}>
          <LogOut size={16} className="mr-2" />Sign Out
        </Button>
      </div>
    </div>
  );
}
