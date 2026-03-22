import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Trophy, Dumbbell, Flame, Plus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const SAMPLE_POSTS = [
  {
    id: 1,
    user: { name: "Alex M.", avatar: "💪" },
    type: "workout",
    content: "Just crushed a 90-minute leg day! Squatted 140kg for the first time 🔥",
    workout: { title: "Leg Day Destroyer", duration: 90, calories: 720 },
    likes: 24,
    comments: 5,
    time: new Date(Date.now() - 2 * 60 * 60 * 1000),
    liked: false,
  },
  {
    id: 2,
    user: { name: "Sarah K.", avatar: "🏃" },
    type: "achievement",
    content: "Just hit my 30-day workout streak! Never felt better 💎",
    achievement: { title: "Iron Will", icon: "💎" },
    likes: 47,
    comments: 12,
    time: new Date(Date.now() - 5 * 60 * 60 * 1000),
    liked: true,
  },
  {
    id: 3,
    user: { name: "Mike T.", avatar: "🏋️" },
    type: "pr",
    content: "New bench press PR — 120kg! The grind pays off 🏆",
    pr: { exercise: "Bench Press", value: 120, unit: "kg" },
    likes: 38,
    comments: 8,
    time: new Date(Date.now() - 24 * 60 * 60 * 1000),
    liked: false,
  },
  {
    id: 4,
    user: { name: "Emma L.", avatar: "🧘" },
    type: "workout",
    content: "Morning yoga + HIIT combo. Starting the week strong! 🌅",
    workout: { title: "Morning Power Flow", duration: 45, calories: 380 },
    likes: 19,
    comments: 3,
    time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    liked: false,
  },
];

export default function Social() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState(SAMPLE_POSTS);
  const [showShare, setShowShare] = useState(false);
  const [shareText, setShareText] = useState("");

  const { data: recentSessions } = trpc.workout.getSessions.useQuery({ limit: 5 });

  const handleLike = (id: number) => {
    setPosts((prev) => prev.map((p) =>
      p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };

  const handleShare = () => {
    if (!shareText.trim()) return;
    const newPost: any = {
      id: Date.now(),
      user: { name: user?.name || "You", avatar: "🏋️" },
      type: "workout",
      content: shareText,
      workout: recentSessions?.[0]
        ? { title: recentSessions[0].title, duration: recentSessions[0].durationMinutes ?? 0, calories: recentSessions[0].caloriesBurned || 0 }
        : undefined,
      likes: 0,
      comments: 0,
      time: new Date(),
      liked: false,
    };
    setPosts((prev) => [newPost, ...prev]);
    setShareText("");
    setShowShare(false);
    toast.success("Shared with the community! +25 XP 🎉");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-1">Community</h1>
          <p className="text-muted-foreground text-sm">See what athletes are crushing</p>
        </div>
        {isAuthenticated && (
          <Button size="sm" className="rounded-xl" onClick={() => setShowShare(true)}>
            <Plus size={16} className="mr-1" />Share
          </Button>
        )}
      </div>

      {/* Leaderboard mini */}
      <div className="px-5 mb-5">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={16} className="text-yellow-400" />
            <span className="text-sm font-semibold text-foreground">This Week's Leaders</span>
          </div>
          <div className="space-y-2">
            {[
              { rank: 1, name: "Alex M.", xp: 2840, avatar: "💪" },
              { rank: 2, name: "Sarah K.", xp: 2510, avatar: "🏃" },
              { rank: 3, name: "Mike T.", xp: 2280, avatar: "🏋️" },
            ].map(({ rank, name, xp, avatar }) => (
              <div key={rank} className="flex items-center gap-3">
                <span className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold",
                  rank === 1 ? "bg-yellow-400/20 text-yellow-400" :
                  rank === 2 ? "bg-gray-400/20 text-gray-400" :
                  "bg-orange-400/20 text-orange-400")}>
                  {rank}
                </span>
                <span className="text-lg">{avatar}</span>
                <span className="flex-1 text-sm font-medium text-foreground">{name}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-primary">{xp.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="px-5 space-y-4 pb-8">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onLike={() => handleLike(post.id)} />
        ))}
      </div>

      {/* Share modal */}
      {showShare && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end max-w-[430px] mx-auto">
          <div className="w-full bg-card border-t border-border rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg">Share with Community</h3>
              <button onClick={() => setShowShare(false)}><X size={20} className="text-muted-foreground" /></button>
            </div>

            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-lg">🏋️</div>
              <textarea
                placeholder="Share your progress, workout, or motivation..."
                value={shareText}
                onChange={(e) => setShareText(e.target.value)}
                className="flex-1 min-h-[100px] p-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
              />
            </div>

            {recentSessions?.[0] && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted mb-4">
                <Dumbbell size={16} className="text-primary" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">{recentSessions[0].title}</p>
                  <p className="text-xs text-muted-foreground">{recentSessions[0].durationMinutes}min · {recentSessions[0].caloriesBurned || 0} kcal</p>
                </div>
                <span className="text-xs text-primary font-medium">Attach</span>
              </div>
            )}

            <Button className="w-full h-12 rounded-xl glow-primary" onClick={handleShare} disabled={!shareText.trim()}>
              <Share2 size={16} className="mr-2" />Post to Community
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function PostCard({ post, onLike }: { post: any; onLike: () => void }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      {/* User row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg">
          {post.user.avatar}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm text-foreground">{post.user.name}</p>
          <p className="text-xs text-muted-foreground">{formatDistanceToNow(post.time, { addSuffix: true })}</p>
        </div>
        {post.type === "achievement" && (
          <span className="text-xs px-2 py-1 rounded-lg bg-yellow-400/10 text-yellow-400 font-medium">Achievement</span>
        )}
        {post.type === "pr" && (
          <span className="text-xs px-2 py-1 rounded-lg bg-green-400/10 text-green-400 font-medium">New PR</span>
        )}
      </div>

      {/* Content */}
      <p className="text-sm text-foreground mb-3 leading-relaxed">{post.content}</p>

      {/* Workout card */}
      {post.workout && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted mb-3">
          <Dumbbell size={16} className="text-primary" />
          <div>
            <p className="text-xs font-medium text-foreground">{post.workout.title}</p>
            <p className="text-xs text-muted-foreground">{post.workout.duration}min · {post.workout.calories} kcal</p>
          </div>
        </div>
      )}

      {/* Achievement card */}
      {post.achievement && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-yellow-400/5 border border-yellow-400/20 mb-3">
          <span className="text-2xl">{post.achievement.icon}</span>
          <p className="text-sm font-semibold text-foreground">{post.achievement.title}</p>
        </div>
      )}

      {/* PR card */}
      {post.pr && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-green-400/5 border border-green-400/20 mb-3">
          <Trophy size={16} className="text-green-400" />
          <p className="text-sm font-semibold text-foreground">
            {post.pr.exercise}: <span className="text-green-400">{post.pr.value}{post.pr.unit}</span>
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-border/50">
        <button onClick={onLike} className={cn("flex items-center gap-1.5 text-sm transition-all", post.liked ? "text-red-400" : "text-muted-foreground hover:text-red-400")}>
          <Heart size={16} fill={post.liked ? "currentColor" : "none"} />
          <span>{post.likes}</span>
        </button>
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all">
          <MessageCircle size={16} />
          <span>{post.comments}</span>
        </button>
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all ml-auto" onClick={() => toast.success("Link copied!")}>
          <Share2 size={16} />
          Share
        </button>
      </div>
    </div>
  );
}
