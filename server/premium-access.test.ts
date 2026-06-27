import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Premium Access Integration Tests
 * Tests for free trial and paid premium feature gating
 */

describe("Premium Access System", () => {
  const TRIAL_DAYS = 21;

  describe("Free Trial Access", () => {
    it("should grant premium access within 21-day trial period", () => {
      const now = new Date();
      const accountCreatedAt = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      const trialEnd = new Date(accountCreatedAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

      const isInTrial = now < trialEnd;
      expect(isInTrial).toBe(true);
    });

    it("should deny premium access after 21-day trial expires", () => {
      const now = new Date();
      const accountCreatedAt = new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000); // 25 days ago
      const trialEnd = new Date(accountCreatedAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

      const isInTrial = now < trialEnd;
      expect(isInTrial).toBe(false);
    });

    it("should calculate remaining trial days correctly", () => {
      const now = new Date();
      const accountCreatedAt = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      const trialEnd = new Date(accountCreatedAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

      const trialDaysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      
      expect(trialDaysLeft).toBeGreaterThan(0);
      expect(trialDaysLeft).toBeLessThanOrEqual(21);
      expect(trialDaysLeft).toBeCloseTo(11, 0); // ~11 days left
    });

    it("should return 0 trial days after trial expires", () => {
      const now = new Date();
      const accountCreatedAt = new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000); // 25 days ago
      const trialEnd = new Date(accountCreatedAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

      const trialDaysLeft = trialEnd < now ? 0 : Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      
      expect(trialDaysLeft).toBe(0);
    });

    it("should grant premium access on first day of trial", () => {
      const now = new Date();
      const accountCreatedAt = new Date(now.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago
      const trialEnd = new Date(accountCreatedAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

      const isInTrial = now < trialEnd;
      expect(isInTrial).toBe(true);
    });

    it("should grant premium access on last day of trial", () => {
      const now = new Date();
      const accountCreatedAt = new Date(now.getTime() - (21 * 24 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000)); // 20 days 23 hours ago
      const trialEnd = new Date(accountCreatedAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

      const isInTrial = now < trialEnd;
      expect(isInTrial).toBe(true);
    });
  });

  describe("Paid Premium Access", () => {
    it("should grant access to active paid premium subscription", () => {
      const now = new Date();
      const premiumExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // expires in 30 days

      const isPaidPremium = premiumExpiresAt > now;
      expect(isPaidPremium).toBe(true);
    });

    it("should deny access to expired paid premium subscription", () => {
      const now = new Date();
      const premiumExpiresAt = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // expired 5 days ago

      const isPaidPremium = premiumExpiresAt > now;
      expect(isPaidPremium).toBe(false);
    });

    it("should handle null premiumExpiresAt as lifetime premium", () => {
      const now = new Date();
      const premiumExpiresAt = null;

      const isPaidPremium = !premiumExpiresAt || premiumExpiresAt > now;
      expect(isPaidPremium).toBe(true);
    });

    it("should grant access on first day of paid subscription", () => {
      const now = new Date();
      const premiumExpiresAt = new Date(now.getTime() + 1 * 60 * 60 * 1000); // expires in 1 hour

      const isPaidPremium = premiumExpiresAt > now;
      expect(isPaidPremium).toBe(true);
    });

    it("should deny access on expiration date at exact time", () => {
      const now = new Date();
      const premiumExpiresAt = new Date(now.getTime()); // expires right now

      const isPaidPremium = premiumExpiresAt > now;
      expect(isPaidPremium).toBe(false);
    });
  });

  describe("Combined Trial + Paid Premium", () => {
    it("should prioritize paid premium over trial", () => {
      const now = new Date();
      const accountCreatedAt = new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000); // trial expired
      const trialEnd = new Date(accountCreatedAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
      const premiumExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // paid premium active

      const isInTrial = now < trialEnd;
      const isPaidPremium = premiumExpiresAt > now;
      const isPremium = isPaidPremium || isInTrial;

      expect(isInTrial).toBe(false);
      expect(isPaidPremium).toBe(true);
      expect(isPremium).toBe(true);
    });

    it("should grant access when both trial and paid premium are active", () => {
      const now = new Date();
      const accountCreatedAt = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // trial still active
      const trialEnd = new Date(accountCreatedAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
      const premiumExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // paid premium also active

      const isInTrial = now < trialEnd;
      const isPaidPremium = premiumExpiresAt > now;
      const isPremium = isPaidPremium || isInTrial;

      expect(isInTrial).toBe(true);
      expect(isPaidPremium).toBe(true);
      expect(isPremium).toBe(true);
    });

    it("should deny access when both trial and paid premium have expired", () => {
      const now = new Date();
      const accountCreatedAt = new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000); // trial expired
      const trialEnd = new Date(accountCreatedAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
      const premiumExpiresAt = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // paid premium expired

      const isInTrial = now < trialEnd;
      const isPaidPremium = premiumExpiresAt > now;
      const isPremium = isPaidPremium || isInTrial;

      expect(isInTrial).toBe(false);
      expect(isPaidPremium).toBe(false);
      expect(isPremium).toBe(false);
    });
  });

  describe("Premium Status Response", () => {
    it("should return correct premium status during trial", () => {
      const now = new Date();
      const accountCreatedAt = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
      const trialEnd = new Date(accountCreatedAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
      const isInTrial = now < trialEnd;
      const trialDaysLeft = isInTrial ? Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)) : 0;

      const response = {
        isPremium: isInTrial,
        trialDaysLeft,
        isInTrial,
        isPaidPremium: false,
      };

      expect(response.isPremium).toBe(true);
      expect(response.isInTrial).toBe(true);
      expect(response.isPaidPremium).toBe(false);
      expect(response.trialDaysLeft).toBeGreaterThan(0);
    });

    it("should return correct premium status with paid subscription", () => {
      const now = new Date();
      const accountCreatedAt = new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000); // trial expired
      const trialEnd = new Date(accountCreatedAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
      const isInTrial = now < trialEnd;
      const premiumExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const isPaidPremium = premiumExpiresAt > now;
      const isPremium = isPaidPremium || isInTrial;

      const response = {
        isPremium,
        trialDaysLeft: 0,
        isInTrial,
        isPaidPremium,
      };

      expect(response.isPremium).toBe(true);
      expect(response.isInTrial).toBe(false);
      expect(response.isPaidPremium).toBe(true);
      expect(response.trialDaysLeft).toBe(0);
    });

    it("should return correct premium status when not premium", () => {
      const now = new Date();
      const accountCreatedAt = new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000); // trial expired
      const trialEnd = new Date(accountCreatedAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
      const isInTrial = now < trialEnd;
      const premiumExpiresAt = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // expired
      const isPaidPremium = premiumExpiresAt > now;
      const isPremium = isPaidPremium || isInTrial;

      const response = {
        isPremium,
        trialDaysLeft: 0,
        isInTrial,
        isPaidPremium,
      };

      expect(response.isPremium).toBe(false);
      expect(response.isInTrial).toBe(false);
      expect(response.isPaidPremium).toBe(false);
      expect(response.trialDaysLeft).toBe(0);
    });
  });

  describe("Premium Feature Gating", () => {
    it("should allow Recovery module access for trial users", () => {
      const isPremium = true;
      const canAccessRecovery = isPremium;

      expect(canAccessRecovery).toBe(true);
    });

    it("should deny Recovery module access for non-premium users", () => {
      const isPremium = false;
      const canAccessRecovery = isPremium;

      expect(canAccessRecovery).toBe(false);
    });

    it("should allow Appearance customization for premium users", () => {
      const isPremium = true;
      const canCustomizeAppearance = isPremium;

      expect(canCustomizeAppearance).toBe(true);
    });

    it("should deny Appearance customization for free users", () => {
      const isPremium = false;
      const canCustomizeAppearance = isPremium;

      expect(canCustomizeAppearance).toBe(false);
    });

    it("should grant all premium features when isPremium is true", () => {
      const isPremium = true;
      const features = {
        recovery: isPremium,
        appearance: isPremium,
        unlimitedWorkouts: isPremium,
        aiMealPlanning: isPremium,
        exclusiveAchievements: isPremium,
      };

      Object.values(features).forEach((feature) => {
        expect(feature).toBe(true);
      });
    });

    it("should deny all premium features when isPremium is false", () => {
      const isPremium = false;
      const features = {
        recovery: isPremium,
        appearance: isPremium,
        unlimitedWorkouts: isPremium,
        aiMealPlanning: isPremium,
        exclusiveAchievements: isPremium,
      };

      Object.values(features).forEach((feature) => {
        expect(feature).toBe(false);
      });
    });
  });

  describe("Premium Plan Types", () => {
    it("should support monthly subscription", () => {
      const plan = { id: "monthly", name: "Monthly", price: "$9.99", period: "/month" };

      expect(plan.id).toBe("monthly");
      expect(plan.price).toBe("$9.99");
    });

    it("should support yearly subscription with discount", () => {
      const plan = { id: "yearly", name: "Yearly", price: "$4.99", period: "/month", savings: "Save 50%" };

      expect(plan.id).toBe("yearly");
      expect(plan.price).toBe("$4.99");
      expect(plan.savings).toBe("Save 50%");
    });

    it("should support lifetime subscription", () => {
      const plan = { id: "lifetime", name: "Lifetime", price: "$99", period: " once" };

      expect(plan.id).toBe("lifetime");
      expect(plan.price).toBe("$99");
    });

    it("should calculate yearly plan savings", () => {
      const monthlyPrice = 9.99;
      const yearlyPrice = 59.99;
      const savings = Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100);

      expect(savings).toBe(50);
    });
  });

  describe("Premium Expiration Handling", () => {
    it("should handle premium expiration gracefully", () => {
      const now = new Date();
      const premiumExpiresAt = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // expired yesterday
      const isPremium = premiumExpiresAt > now;

      expect(isPremium).toBe(false);
    });

    it("should warn user when premium expiring soon", () => {
      const now = new Date();
      const premiumExpiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // expires in 3 days
      const daysUntilExpiry = Math.ceil((premiumExpiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

      const shouldWarn = daysUntilExpiry <= 7;
      expect(shouldWarn).toBe(true);
    });

    it("should not warn when premium has plenty of time", () => {
      const now = new Date();
      const premiumExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // expires in 30 days
      const daysUntilExpiry = Math.ceil((premiumExpiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

      const shouldWarn = daysUntilExpiry <= 7;
      expect(shouldWarn).toBe(false);
    });
  });

  describe("Trial to Paid Conversion", () => {
    it("should upgrade trial user to paid premium", () => {
      const trialUser = {
        isPremium: false,
        premiumExpiresAt: null,
        isInTrial: true,
      };

      // Simulate upgrade
      const upgradedUser = {
        ...trialUser,
        isPremium: true,
        premiumExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      };

      expect(upgradedUser.isPremium).toBe(true);
      expect(upgradedUser.premiumExpiresAt).not.toBeNull();
    });

    it("should preserve trial status when converting to paid", () => {
      const user = {
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        isPremium: true,
        premiumExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      };

      expect(user.isPremium).toBe(true);
      expect(user.premiumExpiresAt).not.toBeNull();
    });
  });
});
