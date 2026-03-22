import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ChevronLeft, UserPlus, Check, X, Share2, Copy, Link2, Loader2, Trophy, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Friends() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [showInvite, setShowInvite] = useState(false);

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
    { count: 3, referrerDays: 14, friendDays: 7, icon: "🎯", label: "Tier 1", claimed: referralStats?.tier3 },
    { count: 5, referrerDays: 30, friendDays: 14, icon: "🚀", label: "Tier 2", claimed: referralStats?.tier5 },
    { count: 10, referrerDays: 90, friendDays: 30, icon: "👑", label: "Tier 3", claimed: referralStats?.tier10 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/social")} className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center">
            <ChevronLeft size={18} />
          </button>
          <h1 className="text-2xl font-display font-bold text-foreground">Referrals</h1>
        </div>
      </div>

      {/* Invite section */}
      <div className="px-5 mb-5">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-foreground text-sm">Invite Friends</h3>
              <p className="text-xs text-muted-foreground">Earn premium together</p>
            </div>
            <button onClick={() => setShowInvite(!showInvite)} className="text-primary text-sm font-medium">
              {showInvite ? "Hide" : "Show"}
            </button>
          </div>

          {showInvite && (
            <div className="space-y-3 pt-3 border-t border-border">
              {referralCode ? (
                <>
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-10 rounded-xl"
                    onClick={() => {
                      const text = `Join me on VYRO! Use my referral code: ${referralCode.code}\n\n${referralCode.url}`;
                      navigator.share?.({ title: "VYRO Fitness", text }) || copyToClipboard(text);
                    }}
                  >
                    <Share2 size={14} className="mr-1" />
                    Share Link
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  className="w-full h-10 rounded-xl"
                  onClick={() => generateCode.mutate()}
                  disabled={generateCode.isPending || codeLoading}
                >
                  {generateCode.isPending || codeLoading ? <Loader2 size={14} className="mr-1 animate-spin" /> : null}
                  Generate Referral Code
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tier rewards */}
      <div className="px-5 mb-5">
        <h3 className="font-semibold text-sm mb-3">Reward Tiers</h3>
        <div className="space-y-2">
          {tiers.map((tier) => (
            <div
              key={tier.count}
              className={`relative overflow-hidden rounded-2xl border p-4 transition-all ${
                tier.claimed
                  ? "bg-green-400/5 border-green-400/30"
                  : referralStats && referralStats.validSignups >= tier.count
                    ? "bg-primary/5 border-primary/30"
                    : "bg-card border-border"
              }`}
            >
              {/* Progress bar */}
              <div className="absolute inset-0 h-full bg-gradient-to-r from-primary/10 to-transparent" style={{ width: `${Math.min((referralStats?.validSignups || 0) / tier.count, 1) * 100}%` }} />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tier.icon}</span>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{tier.label}</p>
                    <p className="text-xs text-muted-foreground">{tier.count} valid signups</p>
                  </div>
                </div>

                <div className="text-right">
                  {tier.claimed ? (
                    <div className="flex items-center gap-1 text-green-400 font-medium text-sm">
                      <Check size={16} />
                      Claimed
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-bold text-foreground">{referralStats?.validSignups || 0}/{tier.count}</p>
                      <p className="text-xs text-muted-foreground">{tier.referrerDays}w for you</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Reward details */}
              <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1 text-foreground">
                  <Zap size={12} className="text-primary" />
                  You: {tier.referrerDays}d premium
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  Friends: {tier.friendDays}d premium each
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Referral list */}
      {referralDetails && referralDetails.signups.length > 0 && (
        <div className="px-5 pb-10">
          <h3 className="font-semibold text-sm mb-3">Referred Friends ({referralDetails.validSignups} valid)</h3>
          <div className="space-y-2">
            {referralDetails.signups.map((signup) => (
              <div
                key={signup.id}
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  signup.isValid ? "bg-green-400/5 border-green-400/20" : "bg-muted border-border"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {signup.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{signup.name || "Friend"}</p>
                  <p className="text-xs text-muted-foreground">
                    {signup.isValid ? "✓ Validated" : "Pending validation"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!referralDetails || referralDetails.signups.length === 0 ? (
        <div className="px-5 pb-10 text-center py-8">
          <Trophy size={32} className="mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-muted-foreground text-sm">No referrals yet. Share your code to get started!</p>
        </div>
      ) : null}
    </div>
  );
}
