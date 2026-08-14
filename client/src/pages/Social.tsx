import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Trophy, Dumbbell, Plus, X, Loader2, Lock, Users, Globe2, Medal, FileText, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";

type Audience = "public" | "friends" | "private";
type Difficulty = "easy" | "moderate" | "challenging" | "max_effort";

type FeedItem = {
  id: number;
  type: "workout_completed" | "achievement_earned" | "pr_set" | "streak_milestone" | "joined";
  title: string;
  description: string | null;
  metadata: unknown;
  privateNotes: string | null;
  audience: Audience;
  likesCount: number;
  createdAt: Date;
  userId: number;
  userName: string | null;
  avatarUrl: string | null;
};

type WorkoutMetadata = {
  workoutTitle?: string;
  title?: string;
  durationMinutes?: number | null;
  caloriesBurned?: number | null;
  difficulty?: Difficulty;
  achievements?: Array<{ id: number; name: string; icon: string }>;
  personalRecords?: Array<{ id: number; exerciseName: string; value: number; unit: string }>;
};

const AUDIENCES: Array<{ value: Audience; label: string; description: string; icon: typeof Globe2 }> = [
  { value: "public", label: "Public", description: "Visible to the VYRO community", icon: Globe2 },
  { value: "friends", label: "Friends", description: "Visible only to accepted friends", icon: Users },
  { value: "private", label: "Only me", description: "Visible only to you", icon: Lock },
];

const DIFFICULTIES: Array<{ value: Difficulty; label: string }> = [
  { value: "easy", label: "Easy" },
  { value: "moderate", label: "Moderate" },
  { value: "challenging", label: "Challenging" },
  { value: "max_effort", label: "Max effort" },
];

function getWorkoutMetadata(metadata: unknown): WorkoutMetadata | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  return metadata as WorkoutMetadata;
}

function toggleId(ids: number[], id: number) {
  return ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id];
}

export default function Social() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [showShare, setShowShare] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [postTitle, setPostTitle] = useState("");
  const [reflection, setReflection] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("moderate");
  const [audience, setAudience] = useState<Audience>("public");
  const [achievementIds, setAchievementIds] = useState<number[]>([]);
  const [personalRecordIds, setPersonalRecordIds] = useState<number[]>([]);

  const { data: feed = [], isLoading } = trpc.social.getFeed.useQuery({ limit: 25 });
  const { data: likedItemIds = [] } = trpc.social.getMyLikes.useQuery(undefined, { enabled: isAuthenticated });
  const { data: sessions = [] } = trpc.workout.getSessions.useQuery({ limit: 25 }, { enabled: isAuthenticated });
  const { data: shareOptions, isLoading: shareOptionsLoading } = trpc.social.getShareOptions.useQuery(
    { sessionId: selectedSessionId ?? 0 },
    { enabled: Boolean(selectedSessionId) }
  );

  useEffect(() => {
    if (selectedSessionId || !sessions[0]) return;
    setSelectedSessionId(sessions[0].id);
    setPostTitle(`Completed ${sessions[0].title}`);
  }, [selectedSessionId, sessions]);

  useEffect(() => {
    setAchievementIds([]);
    setPersonalRecordIds([]);
  }, [selectedSessionId]);

  const createPost = trpc.social.createPost.useMutation({
    onSuccess: async () => {
      await utils.social.getFeed.invalidate();
      setShowShare(false);
      setReflection("");
      setPrivateNotes("");
      setAchievementIds([]);
      setPersonalRecordIds([]);
      toast.success(audience === "private" ? "Saved privately" : audience === "friends" ? "Shared with friends" : "Shared with the community");
    },
    onError: (error) => toast.error(error.message || "Unable to share this workout"),
  });

  const likeItem = trpc.social.likeItem.useMutation({
    onSuccess: () => {
      utils.social.getFeed.invalidate();
      utils.social.getMyLikes.invalidate();
    },
    onError: (error) => toast.error(error.message || "Unable to update this like"),
  });

  const selectSession = (session: typeof sessions[number]) => {
    setSelectedSessionId(session.id);
    setPostTitle(`Completed ${session.title}`);
  };

  const handleShare = () => {
    if (!selectedSessionId) {
      toast.error("Choose a workout from your history first");
      return;
    }
    createPost.mutate({
      sessionId: selectedSessionId,
      title: postTitle.trim(),
      publicReflection: reflection.trim(),
      privateNotes: privateNotes.trim() || undefined,
      difficulty,
      audience,
      achievementIds,
      personalRecordIds,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-1">Community</h1>
          <p className="text-muted-foreground text-sm">Share your training on your terms</p>
        </div>
        {isAuthenticated && (
          <Button size="sm" className="rounded-xl" onClick={() => setShowShare(true)}>
            <Plus size={16} className="mr-1" />Share
          </Button>
        )}
      </div>

      <div className="px-5 space-y-4 pb-8">
        {isLoading ? (
          <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : feed.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-7 text-center">
            <Dumbbell className="w-7 h-7 text-primary mx-auto mb-3" />
            <h2 className="font-semibold text-foreground">Share your next win</h2>
            <p className="text-sm text-muted-foreground mt-1">Choose a workout and decide whether it is public, friends-only, or just for you.</p>
            {isAuthenticated && <Button className="mt-4 rounded-xl" onClick={() => setShowShare(true)}>Create a workout post</Button>}
          </div>
        ) : (
          (feed as FeedItem[]).map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isOwner={post.userId === user?.id}
              liked={likedItemIds.includes(post.id)}
              onLike={() => likeItem.mutate({ feedItemId: post.id })}
              isLiking={likeItem.isPending}
            />
          ))
        )}
      </div>

      {showShare && (
        <div className="fixed inset-0 z-50 bg-background/85 backdrop-blur-sm flex items-end max-w-[430px] mx-auto">
          <div className="w-full max-h-[92vh] overflow-y-auto bg-card border-t border-border rounded-t-3xl p-5 space-y-5 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-lg">Share a workout</h2>
                <p className="text-xs text-muted-foreground">Build the post, then choose exactly who sees it.</p>
              </div>
              <button aria-label="Close sharing dialog" onClick={() => setShowShare(false)}><X size={20} className="text-muted-foreground" /></button>
            </div>

            <section className="space-y-2">
              <div className="flex items-center gap-2"><Dumbbell size={15} className="text-primary" /><h3 className="text-sm font-semibold">Choose from workout history</h3></div>
              {sessions.length === 0 ? (
                <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">Finish a workout first to share it here.</p>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                  {sessions.map((session) => (
                    <button key={session.id} type="button" onClick={() => selectSession(session)} className={cn("w-full flex items-center gap-3 rounded-xl border p-3 text-left", selectedSessionId === session.id ? "border-primary bg-primary/10" : "border-border bg-muted/50")}>
                      <span className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center"><Dumbbell size={15} /></span>
                      <span className="flex-1 min-w-0"><span className="block text-sm font-medium text-foreground truncate">{session.title}</span><span className="block text-xs text-muted-foreground">{format(new Date(session.completedAt), "MMM d")} · {session.durationMinutes ?? 0} min</span></span>
                      {selectedSessionId === session.id && <span className="text-xs font-semibold text-primary">Selected</span>}
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-3">
              <label className="block space-y-1"><span className="text-sm font-semibold">Post title</span><input value={postTitle} onChange={(event) => setPostTitle(event.target.value)} maxLength={300} placeholder="Give this workout a title" className="w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50" /></label>
              <label className="block space-y-1"><span className="text-sm font-semibold">How did it go?</span><textarea value={reflection} onChange={(event) => setReflection(event.target.value)} maxLength={500} placeholder="Share the effort, a lesson, or a highlight..." className="w-full min-h-24 rounded-xl border border-border bg-muted p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 resize-none" /></label>
              <div><span className="text-sm font-semibold">Difficulty</span><div className="grid grid-cols-2 gap-2 mt-2">{DIFFICULTIES.map((option) => <button key={option.value} type="button" onClick={() => setDifficulty(option.value)} className={cn("rounded-lg border px-3 py-2 text-xs font-medium", difficulty === option.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}>{option.label}</button>)}</div></div>
            </section>

            <section className="space-y-2">
              <div className="flex items-center gap-2"><Medal size={15} className="text-yellow-400" /><h3 className="text-sm font-semibold">Showcase achievements & PRs</h3></div>
              {shareOptionsLoading ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : (
                <>
                  {(shareOptions?.achievements.length ?? 0) === 0 && (shareOptions?.personalRecords.length ?? 0) === 0 ? <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">No eligible achievements or PRs were recorded after this workout yet.</p> : null}
                  {shareOptions?.achievements.map((achievement) => <ToggleChip key={achievement.id} selected={achievementIds.includes(achievement.id)} onClick={() => setAchievementIds((ids) => toggleId(ids, achievement.id))} label={`${achievement.badgeIcon} ${achievement.badgeName}`} />)}
                  {shareOptions?.personalRecords.map((record) => <ToggleChip key={record.id} selected={personalRecordIds.includes(record.id)} onClick={() => setPersonalRecordIds((ids) => toggleId(ids, record.id))} label={`${record.exerciseName}: ${record.value}${record.unit}`} />)}
                </>
              )}
            </section>

            <section className="space-y-2">
              <div className="flex items-center gap-2"><FileText size={15} className="text-muted-foreground" /><h3 className="text-sm font-semibold">Private notes <span className="font-normal text-muted-foreground">(only you)</span></h3></div>
              <textarea value={privateNotes} onChange={(event) => setPrivateNotes(event.target.value)} maxLength={2000} placeholder="Keep coaching cues, feelings, or anything personal here..." className="w-full min-h-20 rounded-xl border border-border bg-muted p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Who can see this?</h3>
              <div className="space-y-2">{AUDIENCES.map((option) => { const Icon = option.icon; return <button key={option.value} type="button" onClick={() => setAudience(option.value)} className={cn("w-full flex items-center gap-3 rounded-xl border p-3 text-left", audience === option.value ? "border-primary bg-primary/10" : "border-border bg-muted/50")}><Icon size={16} className={audience === option.value ? "text-primary" : "text-muted-foreground"} /><span className="flex-1"><span className="block text-sm font-medium text-foreground">{option.label}</span><span className="block text-xs text-muted-foreground">{option.description}</span></span>{audience === option.value && <span className="w-2 h-2 rounded-full bg-primary" />}</button>; })}</div>
            </section>

            <Button className="w-full h-12 rounded-xl glow-primary" onClick={handleShare} disabled={!selectedSessionId || !postTitle.trim() || !reflection.trim() || createPost.isPending}>
              {createPost.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Share2 size={16} className="mr-2" />}
              {audience === "private" ? "Save privately" : audience === "friends" ? "Share with friends" : "Post to community"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleChip({ selected, onClick, label }: { selected: boolean; onClick: () => void; label: string }) {
  return <button type="button" onClick={onClick} className={cn("mr-2 mb-2 rounded-full border px-3 py-1.5 text-xs", selected ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}>{selected ? "✓ " : ""}{label}</button>;
}

function PostCard({ post, liked, onLike, isLiking, isOwner }: { post: FeedItem; liked: boolean; onLike: () => void; isLiking: boolean; isOwner: boolean }) {
  const workout = getWorkoutMetadata(post.metadata);
  const initials = (post.userName || "A").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const audienceLabel = post.audience === "private" ? "Only me" : post.audience === "friends" ? "Friends" : "Public";

  return (
    <article className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-3">
        {post.avatarUrl ? <img src={post.avatarUrl} alt="" className="w-10 h-10 rounded-xl object-cover" /> : <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">{initials}</div>}
        <div className="flex-1"><p className="font-semibold text-sm text-foreground">{post.userName || "VYRO athlete"}</p><p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p></div>
        {isOwner && <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[10px] text-muted-foreground">{post.audience === "private" ? <Lock size={10} /> : post.audience === "friends" ? <Users size={10} /> : <Globe2 size={10} />}{audienceLabel}</span>}
      </div>
      <h2 className="text-sm font-semibold text-foreground mb-1">{post.title}</h2>
      {post.description && <p className="text-sm text-muted-foreground leading-relaxed mb-3">{post.description}</p>}
      {workout?.workoutTitle || workout?.title ? <div className="flex items-center gap-3 p-3 rounded-xl bg-muted mb-3"><Dumbbell size={16} className="text-primary" /><div className="flex-1"><p className="text-xs font-medium text-foreground">{workout.workoutTitle || workout.title}</p><p className="text-xs text-muted-foreground">{workout.durationMinutes ?? 0} min{workout.difficulty ? ` · ${workout.difficulty.replace("_", " ")}` : ""}</p></div></div> : null}
      {workout?.achievements?.map((achievement) => <div key={achievement.id} className="mb-2 rounded-xl border border-yellow-400/20 bg-yellow-400/5 px-3 py-2 text-xs text-yellow-400">{achievement.icon} {achievement.name}</div>)}
      {workout?.personalRecords?.map((record) => <div key={record.id} className="mb-2 rounded-xl border border-green-400/20 bg-green-400/5 px-3 py-2 text-xs text-green-400">PR · {record.exerciseName}: {record.value}{record.unit}</div>)}
      {isOwner && post.privateNotes ? <div className="mt-3 rounded-xl border border-dashed border-border bg-muted/50 p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Private notes · only you</p><p className="mt-1 text-xs text-foreground whitespace-pre-wrap">{post.privateNotes}</p></div> : null}
      <div className="flex items-center pt-3 mt-3 border-t border-border/50"><button disabled={isLiking} onClick={onLike} className={cn("flex items-center gap-1.5 text-sm transition-all", liked ? "text-red-400" : "text-muted-foreground hover:text-red-400")}><Heart size={16} fill={liked ? "currentColor" : "none"} /><span>{post.likesCount}</span></button></div>
    </article>
  );
}
