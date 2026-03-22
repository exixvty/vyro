import { useState, useEffect } from "react";
import { X, Share2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ReferralPromptProps {
  title: string;
  message: string;
  trigger: "workout" | "nutrition" | "habit" | "level_up";
  onClose: () => void;
}

export function ReferralPrompt({ title, message, trigger, onClose }: ReferralPromptProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-hide after 8 seconds if not interacted
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const handleShare = () => {
    const text = "Join me on VYRO! Get fit together and earn premium rewards. Use my referral code when you sign up!";
    navigator.share?.({ title: "VYRO Fitness", text }) ||
      (navigator.clipboard.writeText(text), toast.success("Referral message copied!"));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end max-w-[430px] mx-auto">
      <div className="w-full bg-card border-t border-border rounded-t-3xl p-6 animate-slide-up">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Zap size={20} className="text-primary" />
            </div>
            <h3 className="font-display font-bold text-lg text-foreground">{title}</h3>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              onClose();
            }}
            className="p-1 hover:bg-muted rounded-lg transition-all"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{message}</p>

        <div className="bg-muted/50 border border-border rounded-xl p-3 mb-4">
          <p className="text-xs text-muted-foreground">
            <strong>💡 Tip:</strong> Share your referral code with friends. When 3 friends sign up and get active, you both get premium!
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 h-10 rounded-xl"
            onClick={() => {
              setIsVisible(false);
              onClose();
            }}
          >
            Maybe Later
          </Button>
          <Button className="flex-1 h-10 rounded-xl glow-primary" onClick={handleShare}>
            <Share2 size={16} className="mr-2" />
            Share Now
          </Button>
        </div>
      </div>
    </div>
  );
}
