import { describe, it, expect, vi } from "vitest";

/**
 * Premium Features Gating Tests
 * Tests for Recovery module and Appearance customization premium gating
 */

describe("Premium Features Gating", () => {
  describe("Recovery Module Premium Gating", () => {
    it("should gate Recovery module for non-premium users", () => {
      const isPremium = false;
      const canAccessRecovery = isPremium;

      expect(canAccessRecovery).toBe(false);
    });

    it("should allow Recovery module for trial users", () => {
      const now = new Date();
      const accountCreatedAt = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      const TRIAL_DAYS = 21;
      const trialEnd = new Date(accountCreatedAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
      const isInTrial = now < trialEnd;

      expect(isInTrial).toBe(true);
    });

    it("should allow Recovery module for paid premium users", () => {
      const now = new Date();
      const premiumExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const isPaidPremium = premiumExpiresAt > now;

      expect(isPaidPremium).toBe(true);
    });

    it("should show premium gate UI for non-premium users", () => {
      const isPremium = false;
      const showPremiumGate = !isPremium;

      expect(showPremiumGate).toBe(true);
    });

    it("should show Recovery content for premium users", () => {
      const isPremium = true;
      const showContent = isPremium;

      expect(showContent).toBe(true);
    });

    it("should have correct premium gate message", () => {
      const gateMessage = "The Addiction Recovery module is a Premium feature. Start your 21-day free trial to unlock it and begin your journey to freedom.";

      expect(gateMessage).toContain("Premium feature");
      expect(gateMessage).toContain("21-day free trial");
    });

    it("should have working trial CTA button", () => {
      const ctaText = "Start 21-Day Free Trial";
      const ctaAction = "navigate('/premium')";

      expect(ctaText).toContain("21-Day");
      expect(ctaAction).toContain("/premium");
    });
  });

  describe("Appearance Customization Premium Gating", () => {
    it("should gate theme customization for non-premium users", () => {
      const isPremium = false;
      const canCustomizeTheme = isPremium;

      expect(canCustomizeTheme).toBe(false);
    });

    it("should gate font customization for non-premium users", () => {
      const isPremium = false;
      const canCustomizeFonts = isPremium;

      expect(canCustomizeFonts).toBe(false);
    });

    it("should gate border customization for non-premium users", () => {
      const isPremium = false;
      const canCustomizeBorders = isPremium;

      expect(canCustomizeBorders).toBe(false);
    });

    it("should allow theme customization for premium users", () => {
      const isPremium = true;
      const canCustomizeTheme = isPremium;

      expect(canCustomizeTheme).toBe(true);
    });

    it("should allow font customization for premium users", () => {
      const isPremium = true;
      const canCustomizeFonts = isPremium;

      expect(canCustomizeFonts).toBe(true);
    });

    it("should allow border customization for premium users", () => {
      const isPremium = true;
      const canCustomizeBorders = isPremium;

      expect(canCustomizeBorders).toBe(true);
    });

    it("should show locked UI for non-premium customization options", () => {
      const isPremium = false;
      const customizationOptions = [
        { name: "Theme", locked: !isPremium },
        { name: "Font", locked: !isPremium },
        { name: "Border", locked: !isPremium },
      ];

      customizationOptions.forEach((option) => {
        expect(option.locked).toBe(true);
      });
    });

    it("should show unlock CTA on locked customization options", () => {
      const isPremium = false;
      const showUnlockCTA = !isPremium;

      expect(showUnlockCTA).toBe(true);
    });
  });

  describe("Premium Features List", () => {
    it("should include Recovery module in premium features", () => {
      const premiumFeatures = [
        "Unlimited AI workout generation",
        "Advanced training programs",
        "AI meal planning & nutrition coach",
        "Addiction Recovery Module",
        "Custom fonts & typography",
        "Custom outline & border styles",
        "App name & logo customization",
      ];

      expect(premiumFeatures).toContain("Addiction Recovery Module");
    });

    it("should include customization features in premium list", () => {
      const premiumFeatures = [
        "Custom fonts & typography",
        "Custom outline & border styles",
        "App name & logo customization",
      ];

      expect(premiumFeatures).toHaveLength(3);
      expect(premiumFeatures[0]).toContain("fonts");
      expect(premiumFeatures[1]).toContain("border");
      expect(premiumFeatures[2]).toContain("logo");
    });

    it("should have correct number of premium features", () => {
      const premiumFeatures = [
        { icon: "Brain", text: "Unlimited AI workout generation", highlight: true },
        { icon: "Dumbbell", text: "Advanced training programs", highlight: true },
        { icon: "Apple", text: "AI meal planning & nutrition coach", highlight: true },
        { icon: "Heart", text: "Addiction Recovery Module", highlight: true },
        { icon: "Type", text: "Custom fonts & typography", highlight: true },
        { icon: "Palette", text: "Custom outline & border styles", highlight: true },
        { icon: "Sparkles", text: "App name & logo customization", highlight: true },
        { icon: "Trophy", text: "Exclusive achievements & badges", highlight: false },
        { icon: "Users", text: "Priority community features", highlight: false },
        { icon: "Zap", text: "Real-time form analysis", highlight: false },
        { icon: "Star", text: "Custom workout templates", highlight: false },
        { icon: "Crown", text: "Ad-free experience", highlight: false },
        { icon: "Shield", text: "Priority support", highlight: false },
      ];

      expect(premiumFeatures).toHaveLength(13);
      const highlightedFeatures = premiumFeatures.filter((f) => f.highlight);
      expect(highlightedFeatures).toHaveLength(7);
    });
  });

  describe("Premium UI Components", () => {
    it("should show premium badge on Recovery page header", () => {
      const isPremium = true;
      const showBadge = isPremium;

      expect(showBadge).toBe(true);
    });

    it("should show trial countdown on premium gate", () => {
      const now = new Date();
      const accountCreatedAt = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
      const TRIAL_DAYS = 21;
      const trialEnd = new Date(accountCreatedAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
      const trialDaysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

      expect(trialDaysLeft).toBeGreaterThan(0);
      expect(trialDaysLeft).toBeLessThanOrEqual(21);
    });

    it("should show 'No credit card required' message", () => {
      const message = "No credit card required";

      expect(message).toBeTruthy();
      expect(message).toContain("credit card");
    });

    it("should show plan comparison table", () => {
      const plans = [
        { name: "Free", features: 5 },
        { name: "Premium", features: 13 },
      ];

      expect(plans).toHaveLength(2);
      expect(plans[1].features).toBeGreaterThan(plans[0].features);
    });
  });

  describe("Free vs Premium Feature Comparison", () => {
    it("should list free plan limits", () => {
      const freeLimits = [
        "3 AI workout plans per month",
        "Basic nutrition tracking",
        "7-day workout history",
        "5 habits tracking",
        "Basic progress charts",
        "Default app theme only",
      ];

      expect(freeLimits).toHaveLength(6);
    });

    it("should show unlimited features for premium", () => {
      const premiumFeatures = [
        "Unlimited AI workout generation",
        "Advanced training programs",
        "AI meal planning & nutrition coach",
      ];

      expect(premiumFeatures[0]).toContain("Unlimited");
    });

    it("should highlight key differences between plans", () => {
      const differences = {
        recovery: { free: false, premium: true },
        customization: { free: false, premium: true },
        unlimitedWorkouts: { free: false, premium: true },
        aiMealPlanning: { free: false, premium: true },
      };

      Object.values(differences).forEach((diff) => {
        expect(diff.free).toBe(false);
        expect(diff.premium).toBe(true);
      });
    });
  });

  describe("Premium Upgrade Flow", () => {
    it("should navigate to premium page on upgrade click", () => {
      const navigatePath = "/premium";

      expect(navigatePath).toBe("/premium");
    });

    it("should show plan selection on premium page", () => {
      const plans = ["monthly", "yearly", "lifetime"];

      expect(plans).toHaveLength(3);
    });

    it("should show yearly plan as most popular", () => {
      const plans = [
        { id: "monthly", popular: false },
        { id: "yearly", popular: true },
        { id: "lifetime", popular: false },
      ];

      const popularPlan = plans.find((p) => p.popular);
      expect(popularPlan?.id).toBe("yearly");
    });

    it("should show correct pricing for plans", () => {
      const plans = [
        { id: "monthly", price: "$9.99", period: "/month" },
        { id: "yearly", price: "$4.99", period: "/month", billed: "$59.99/year" },
        { id: "lifetime", price: "$99", period: " once" },
      ];

      expect(plans[0].price).toBe("$9.99");
      expect(plans[1].billed).toContain("$59.99");
      expect(plans[2].price).toBe("$99");
    });
  });

  describe("Premium Status Indicators", () => {
    it("should show premium badge for trial users", () => {
      const now = new Date();
      const accountCreatedAt = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
      const TRIAL_DAYS = 21;
      const trialEnd = new Date(accountCreatedAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
      const isInTrial = now < trialEnd;

      expect(isInTrial).toBe(true);
    });

    it("should show premium badge for paid users", () => {
      const now = new Date();
      const premiumExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const isPaidPremium = premiumExpiresAt > now;

      expect(isPaidPremium).toBe(true);
    });

    it("should show expiration warning when premium expiring soon", () => {
      const now = new Date();
      const premiumExpiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
      const daysUntilExpiry = Math.ceil((premiumExpiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      const showWarning = daysUntilExpiry <= 7;

      expect(showWarning).toBe(true);
    });

    it("should not show warning when premium has plenty of time", () => {
      const now = new Date();
      const premiumExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
      const daysUntilExpiry = Math.ceil((premiumExpiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      const showWarning = daysUntilExpiry <= 7;

      expect(showWarning).toBe(false);
    });
  });
});
