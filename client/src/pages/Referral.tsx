import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Share2, Copy, Link2, Loader2, Trophy, Zap, Users, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Referral() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [showShare, setShowShare] = useState(false);

  const { data: referralStats } = trpc.friends.getReferralStats.useQuery();
  const { data: referralDetails } = trpc.friends.getReferralDetails.useQuery();
  const { data: referralCode, isLoading: codeLoading } = trpc.friends.getReferralCode.useQuery();

  const generateCode = trpc.friends.generateReferralCode.useMutation({
    onSuccess: () => {
      toast.success("Referral code generated!");
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const tiers = [
    {
      id: 1,
      count: 3,
      label: "Bronze",
      icon: "🥉",
      color: "from-amber-500 to-amber-600",
      referrerDays: 14,
      friendDays: 7,
      description: "Get 2 weeks of premium",
      claimed: referralStats?.tier3,
    },
    {
      id: 2,
      count: 5,
      label: "Silver",
      icon: "🥈",
      color: "from-slate-400 to-slate-500",
      referrerDays: 30,
      friendDays: 14,
      description: "Get 1 month of premium",
      claimed: referralStats?.tier5,
    },
    {
      id: 3,
      count: 10,
      label: "Gold",
      icon: "🏆",
      color: "from-yellow-400 to-yellow-500",
      referrerDays: 90,
      friendDays: 30,
      description: "Get 3 months of premium",
      claimed: referralStats?.tier10,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-5 pt-12 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/social")} className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center">
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Referral Program</h1>
            <p className="text-xs text-muted-foreground">Earn premium by inviting friends</p>
          </div>
        </div>
      </div>

      {/* Stats overview */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-primary" />
              <p className="text-xs text-muted-foreground">Valid Signups</p>
            </div>
            <p className="text-3xl font-display font-bold text-foreground">{referralStats?.validSignups || 0}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-primary" />
              <p className="text-xs text-muted-foreground">Total Invites</p>
            </div>
            <p className="text-3xl font-display font-bold text-foreground">{referralDetails?.totalSignups || 0}</p>
          </div>
        </div>
      </div>

      {/* Referral code section */}
      <div className="px-5 mb-6">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Your Referral Code</h3>
            {referralCode && <span className="text-xs px-2 py-1 rounded-lg bg-primary/20 text-primary font-medium">Active</span>}
          </div>

          {referralCode ? (
            <>
              <div className="bg-background border border-border rounded-xl p-4 mb-3">
                <p className="text-xs text-muted-foreground mb-2">Code</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg font-bold text-foreground">{referralCode.code}</span>
                  <button onClick={() => copyToClipboard(referralCode.code)} className="p-2 hover:bg-muted rounded-lg transition-all">
                    <Copy size={16} className="text-primary" />
                  </button>
                </div>
              </div>

              <Button
                className="w-full h-11 rounded-xl glow-primary"
                onClick={() => {
                  const text = `Join me on VYRO! Use my referral code: ${referralCode.code}\n\n${referralCode.url}`;
                  navigator.share?.({ title: "VYRO Fitness", text }) || setShowShare(true);
                }}
              >
                <Share2 size={16} className="mr-2" />
                Share Referral Link
              </Button>
            </>
          ) : (
            <Button
              className="w-full h-11 rounded-xl"
              onClick={() => generateCode.mutate()}
              disabled={generateCode.isPending || codeLoading}
            >
              {generateCode.isPending || codeLoading ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
              Generate My Code
            </Button>
          )}
        </div>
      </div>

      {/* Tier rewards */}
      <div className="px-5 mb-6">
        <h3 className="font-semibold text-sm mb-4">Reward Tiers</h3>
        <div className="space-y-3">
          {tiers.map((tier) => {
            const progress = Math.min((referralStats?.validSignups || 0) / tier.count, 1);
            const isActive = (referralStats?.validSignups || 0) >= tier.count;

            return (
              <div
                key={tier.id}
                className={`relative overflow-hidden rounded-2xl border transition-all ${
                  tier.claimed
                    ? "bg-green-400/5 border-green-400/30"
                    : isActive
                      ? "bg-primary/5 border-primary/30 shadow-lg shadow-primary/20"
                      : "bg-card border-border"
                }`}
              >
                {/* Progress bar background */}
                <div className="absolute inset-0 h-full bg-gradient-to-r from-primary/10 to-transparent" style={{ width: `${progress * 100}%` }} />

                {/* Content */}
                <div className="relative p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{tier.icon}</span>
                      <div>
                        <p className="font-semibold text-foreground">{tier.label}</p>
                        <p className="text-xs text-muted-foreground">{tier.count} valid signups</p>
                      </div>
                    </div>
                    {tier.claimed && <span className="text-xs px-2 py-1 rounded-lg bg-green-400/20 text-green-400 font-medium">✓ Claimed</span>}
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-foreground">{referralStats?.validSignups || 0}/{tier.count}</p>
                      <p className="text-xs text-muted-foreground">{Math.round(progress * 100)}%</p>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-primary/50 rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
                    </div>
                  </div>

                  {/* Rewards */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-primary" />
                      <div>
                        <p className="text-xs font-medium text-foreground">You</p>
                        <p className="text-xs text-muted-foreground">{tier.referrerDays}d premium</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-primary" />
                      <div>
                        <p className="text-xs font-medium text-foreground">Friends</p>
                        <p className="text-xs text-muted-foreground">{tier.friendDays}d each</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How it works */}
      <div className="px-5 mb-6">
        <h3 className="font-semibold text-sm mb-3">How It Works</h3>
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</div>
            <div>
              <p className="text-sm font-medium text-foreground">Share Your Code</p>
              <p className="text-xs text-muted-foreground">Send your referral code to friends</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</div>
            <div>
              <p className="text-sm font-medium text-foreground">They Sign Up</p>
              <p className="text-xs text-muted-foreground">Friends create account with your code</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</div>
            <div>
              <p className="text-sm font-medium text-foreground">They Get Active</p>
              <p className="text-xs text-muted-foreground">Complete first workout to validate</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">4</div>
            <div>
              <p className="text-sm font-medium text-foreground">Earn Rewards</p>
              <p className="text-xs text-muted-foreground">Unlock tiers and claim premium</p>
            </div>
          </div>
        </div>
      </div>

      {/* Anti-cheat notice */}
      <div className="px-5 pb-10">
        <div className="bg-muted/50 border border-border rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">
            <strong>Fair Play:</strong> We verify each signup with device checks and activity validation to ensure a fair referral program for everyone.
          </p>
        </div>
      </div>

      {/* Share modal */}
      {showShare && referralCode && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end max-w-[430px] mx-auto">
          <div className="w-full bg-card border-t border-border rounded-t-3xl p-6 animate-slide-up">
            <h3 className="font-display font-bold text-lg mb-4">Share Your Code</h3>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted">
                <span className="flex-1 font-mono text-sm text-foreground break-all">{referralCode.code}</span>
                <button onClick={() => copyToClipboard(referralCode.code)} className="shrink-0 p-2 hover:bg-border rounded-lg transition-all">
                  <Copy size={14} className="text-muted-foreground" />
                </button>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted overflow-hidden">
                <Link2 size={14} className="text-muted-foreground shrink-0" />
                <span className="flex-1 text-xs text-muted-foreground truncate">{referralCode.url}</span>
                <button onClick={() => copyToClipboard(referralCode.url)} className="shrink-0 p-2 hover:bg-border rounded-lg transition-all">
                  <Copy size={14} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            <Button className="w-full h-12 rounded-xl glow-primary mb-2" onClick={() => setShowShare(false)}>
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
