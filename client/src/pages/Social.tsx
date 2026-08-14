import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Trophy, Dumbbell, Plus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type FeedItem = {
  id: number;
  type: "workout_completed" | "achievement_earned" | "pr_set" | "streak_milestone" | "joined";
  title: string;
  description: string | null;
  metadata: unknown;
  likesCount: number;
  createdAt: Date;
  userId: number;
  userName: string | null;
  avatarUrl: string | null;
};

type WorkoutMetadata = {
  title?: string;
  durationMinutes?: number | null;
  caloriesBurned?: number | null;
};

function getWorkoutMetadata(metadata: unknown): WorkoutMetadata | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  return metadata as WorkoutMetadata;
}

export default function Social() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [showShare, setShowShare] = useState(false);
  const [shareText, setShareText] = useState("");
  const [attachLatestWorkout, setAttachLatestWorkout] = useState(true);
  const { data: feed = [], isLoading } = trpc.social.getFeed.useQuery({ limit: 25 });
  const { data: likedItemIds = [] } = trpc.social.getMyLikes.useQuery(undefined, { enabled: isAuthenticated });
  const { data: recentSessions = [] } = trpc.workout.getSessions.useQuery({ limit: 5 }, { enabled: isAuthenticated });

  const createPost = trpc.social.createPost.useMutation({
    onSuccess: async () => {
      await utils.social.getFeed.invalidate();
      setShareText("");
      setShowShare(false);
      toast.success("Shared with the community");
    },
    onError: (error) => toast.error(error.message || "Unable to share your update"),
  });

  const likeItem = trpc.social.likeItem.useMutation({
    onSuccess: () => {
      utils.social.getFeed.invalidate();
      utils.social.getMyLikes.invalidate();
    },
    onError: () => toast.error("Unable to update this like"),
  });

  const handleShare = () => {
    if (!shareText.trim()) return;
    createPost.mutate({
      content: shareText.trim(),
      sessionId: attachLatestWorkout && recentSessions[0] ? recentSessions[0].id : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-1">Community</h1>
          <p className="text-muted-foreground text-sm">Share your training and celebrate real progress</p>
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
            <h2 className="font-semibold text-foreground">Start the conversation</h2>
            <p className="text-sm text-muted-foreground mt-1">Share a workout, milestone, or training update with the community.</p>
            {isAuthenticated && <Button className="mt-4 rounded-xl" onClick={() => setShowShare(true)}>Create your first post</Button>}
          </div>
        ) : (
          (feed as FeedItem[]).map((post) => (
            <PostCard
              key={post.id}
              post={post}
              liked={likedItemIds.includes(post.id)}
              onLike={() => likeItem.mutate({ feedItemId: post.id })}
              isLiking={likeItem.isPending}
            />
          ))
        )}
      </div>

      {showShare && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end max-w-[430px] mx-auto">
          <div className="w-full bg-card border-t border-border rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Share with Community</h2>
              <button aria-label="Close sharing dialog" onClick={() => setShowShare(false)}><X size={20} className="text-muted-foreground" /></button>
            </div>
            <textarea
              aria-label="Community post"
              placeholder="Share your progress, workout, or motivation..."
              value={shareText}
              onChange={(event) => setShareText(event.target.value)}
              maxLength={500}
              className="w-full min-h-[120px] p-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
            />
            <div className="mt-2 text-right text-xs text-muted-foreground">{shareText.length}/500</div>

            {recentSessions[0] && (
              <button
                type="button"
                onClick={() => setAttachLatestWorkout((value) => !value)}
                className={cn("mt-3 w-full flex items-center gap-3 p-3 rounded-xl border text-left", attachLatestWorkout ? "border-primary bg-primary/10" : "border-border bg-muted")}
              >
                <Dumbbell size={16} className="text-primary" />
                <span className="flex-1 text-xs text-foreground">Attach latest workout: {recentSessions[0].title}</span>
                <span className="text-xs text-primary font-medium">{attachLatestWorkout ? "Attached" : "Attach"}</span>
              </button>
            )}

            <Button className="w-full h-12 rounded-xl glow-primary mt-4" onClick={handleShare} disabled={!shareText.trim() || createPost.isPending}>
              {createPost.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Share2 size={16} className="mr-2" />}
              Post to Community
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function PostCard({ post, liked, onLike, isLiking }: { post: FeedItem; liked: boolean; onLike: () => void; isLiking: boolean }) {
  const workout = getWorkoutMetadata(post.metadata);
  const initials = (post.userName || "A").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <article className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-3">
        {post.avatarUrl ? (
          <img src={post.avatarUrl} alt="" className="w-10 h-10 rounded-xl object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">{initials}</div>
        )}
        <div className="flex-1">
          <p className="font-semibold text-sm text-foreground">{post.userName || "VYRO athlete"}</p>
          <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
        </div>
        {post.type === "achievement_earned" && <Trophy size={16} className="text-yellow-400" />}
      </div>
      <h2 className="text-sm font-semibold text-foreground mb-1">{post.title}</h2>
      {post.description && <p className="text-sm text-muted-foreground leading-relaxed mb-3">{post.description}</p>}
      {workout?.title && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted mb-3">
          <Dumbbell size={16} className="text-primary" />
          <p className="text-xs text-foreground flex-1">{workout.title}</p>
          <span className="text-xs text-muted-foreground">{workout.durationMinutes ?? 0} min</span>
        </div>
      )}
      <div className="flex items-center pt-2 border-t border-border/50">
        <button disabled={isLiking} onClick={onLike} className={cn("flex items-center gap-1.5 text-sm transition-all", liked ? "text-red-400" : "text-muted-foreground hover:text-red-400")}> 
          <Heart size={16} fill={liked ? "currentColor" : "none"} />
          <span>{post.likesCount}</span>
        </button>
      </div>
    </article>
  );
}
