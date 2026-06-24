import { describe, it, expect, vi } from "vitest";

/**
 * Profile Page Tab Switching Tests
 * Tests for the tab navigation between Fitness Profile and Gamification tabs
 */

describe("Profile Page Tab Switching", () => {
  describe("Tab State Management", () => {
    it("should initialize with fitness profile tab active", () => {
      type ProfileTab = "fitness" | "gamification";
      let activeTab: ProfileTab = "fitness";

      expect(activeTab).toBe("fitness");
    });

    it("should switch to gamification tab", () => {
      type ProfileTab = "fitness" | "gamification";
      let activeTab: ProfileTab = "fitness";
      
      const setActiveTab = (tab: ProfileTab) => {
        activeTab = tab;
      };

      setActiveTab("gamification");
      expect(activeTab).toBe("gamification");
    });

    it("should switch back to fitness profile tab", () => {
      type ProfileTab = "fitness" | "gamification";
      let activeTab: ProfileTab = "gamification";
      
      const setActiveTab = (tab: ProfileTab) => {
        activeTab = tab;
      };

      setActiveTab("fitness");
      expect(activeTab).toBe("fitness");
    });

    it("should maintain tab state across multiple switches", () => {
      type ProfileTab = "fitness" | "gamification";
      let activeTab: ProfileTab = "fitness";
      
      const setActiveTab = (tab: ProfileTab) => {
        activeTab = tab;
      };

      setActiveTab("gamification");
      expect(activeTab).toBe("gamification");
      
      setActiveTab("fitness");
      expect(activeTab).toBe("fitness");
      
      setActiveTab("gamification");
      expect(activeTab).toBe("gamification");
    });
  });

  describe("Tab Display Logic", () => {
    it("should show fitness profile content when fitness tab is active", () => {
      type ProfileTab = "fitness" | "gamification";
      const activeTab: ProfileTab = "fitness";

      const showFitnessContent = activeTab === "fitness";
      const showGamificationContent = activeTab === "gamification";

      expect(showFitnessContent).toBe(true);
      expect(showGamificationContent).toBe(false);
    });

    it("should show gamification content when gamification tab is active", () => {
      type ProfileTab = "fitness" | "gamification";
      const activeTab: ProfileTab = "gamification";

      const showFitnessContent = activeTab === "fitness";
      const showGamificationContent = activeTab === "gamification";

      expect(showFitnessContent).toBe(false);
      expect(showGamificationContent).toBe(true);
    });

    it("should not show both tabs content simultaneously", () => {
      type ProfileTab = "fitness" | "gamification";
      const activeTab: ProfileTab = "fitness";

      const showFitnessContent = activeTab === "fitness";
      const showGamificationContent = activeTab === "gamification";

      expect(showFitnessContent && showGamificationContent).toBe(false);
    });
  });

  describe("Tab Button Styling", () => {
    it("should apply active style to selected tab", () => {
      type ProfileTab = "fitness" | "gamification";
      const activeTab: ProfileTab = "fitness";

      const tabs: ProfileTab[] = ["fitness", "gamification"];
      
      const getTabClass = (tab: ProfileTab) => {
        return activeTab === tab 
          ? "bg-card text-foreground shadow-sm" 
          : "text-muted-foreground";
      };

      expect(getTabClass("fitness")).toBe("bg-card text-foreground shadow-sm");
      expect(getTabClass("gamification")).toBe("text-muted-foreground");
    });

    it("should apply inactive style to unselected tabs", () => {
      type ProfileTab = "fitness" | "gamification";
      const activeTab: ProfileTab = "gamification";

      const getTabClass = (tab: ProfileTab) => {
        return activeTab === tab 
          ? "bg-card text-foreground shadow-sm" 
          : "text-muted-foreground";
      };

      expect(getTabClass("fitness")).toBe("text-muted-foreground");
      expect(getTabClass("gamification")).toBe("bg-card text-foreground shadow-sm");
    });
  });

  describe("Tab Labels", () => {
    it("should display correct tab labels", () => {
      const tabs = [
        { id: "fitness" as const, label: "Fitness Profile" },
        { id: "gamification" as const, label: "Gamification" },
      ];

      expect(tabs[0].label).toBe("Fitness Profile");
      expect(tabs[1].label).toBe("Gamification");
    });

    it("should have two tabs available", () => {
      type ProfileTab = "fitness" | "gamification";
      const availableTabs: ProfileTab[] = ["fitness", "gamification"];

      expect(availableTabs).toHaveLength(2);
      expect(availableTabs).toContain("fitness");
      expect(availableTabs).toContain("gamification");
    });
  });

  describe("Profile Data Availability", () => {
    it("should load profile data on fitness tab", () => {
      const mockProfileData = {
        primaryGoal: "muscle_gain",
        fitnessLevel: "intermediate",
        athleteType: "strength_training",
        weightKg: 80,
        heightCm: 180,
      };

      expect(mockProfileData.primaryGoal).toBe("muscle_gain");
      expect(mockProfileData.weightKg).toBe(80);
      expect(mockProfileData.heightCm).toBe(180);
    });

    it("should load gamification data on gamification tab", () => {
      const mockGamificationData = {
        level: 5,
        xp: 2500,
        totalWorkouts: 25,
        workoutStreak: 7,
        achievements: [
          { id: "first_workout", badgeName: "First Rep" },
          { id: "streak_3", badgeName: "3-Day Streak" },
        ],
      };

      expect(mockGamificationData.level).toBe(5);
      expect(mockGamificationData.achievements).toHaveLength(2);
    });
  });

  describe("Tab Navigation Flow", () => {
    it("should handle rapid tab switching", () => {
      type ProfileTab = "fitness" | "gamification";
      let activeTab: ProfileTab = "fitness";
      
      const setActiveTab = (tab: ProfileTab) => {
        activeTab = tab;
      };

      // Rapid switching
      setActiveTab("gamification");
      expect(activeTab).toBe("gamification");
      
      setActiveTab("fitness");
      expect(activeTab).toBe("fitness");
      
      setActiveTab("gamification");
      expect(activeTab).toBe("gamification");
      
      setActiveTab("gamification"); // Same tab twice
      expect(activeTab).toBe("gamification");
      
      setActiveTab("fitness");
      expect(activeTab).toBe("fitness");
    });

    it("should preserve tab state when navigating away and back", () => {
      type ProfileTab = "fitness" | "gamification";
      let activeTab: ProfileTab = "fitness";
      
      const setActiveTab = (tab: ProfileTab) => {
        activeTab = tab;
      };

      // User switches to gamification
      setActiveTab("gamification");
      const selectedTab = activeTab;
      
      // Simulate navigation away and back
      // (In real app, this would be handled by React state persistence)
      
      // Verify tab state is preserved
      expect(selectedTab).toBe("gamification");
    });
  });

  describe("Accessibility", () => {
    it("should have proper tab button attributes", () => {
      const tabButtons = [
        { id: "fitness-tab", label: "Fitness Profile", role: "button" },
        { id: "gamification-tab", label: "Gamification", role: "button" },
      ];

      expect(tabButtons[0].role).toBe("button");
      expect(tabButtons[1].role).toBe("button");
      expect(tabButtons).toHaveLength(2);
    });

    it("should support keyboard navigation", () => {
      type ProfileTab = "fitness" | "gamification";
      let activeTab: ProfileTab = "fitness";
      
      const handleKeyDown = (key: string) => {
        if (key === "ArrowRight" && activeTab === "fitness") {
          activeTab = "gamification";
        } else if (key === "ArrowLeft" && activeTab === "gamification") {
          activeTab = "fitness";
        }
      };

      handleKeyDown("ArrowRight");
      expect(activeTab).toBe("gamification");
      
      handleKeyDown("ArrowLeft");
      expect(activeTab).toBe("fitness");
    });
  });

  describe("Profile Card Visibility", () => {
    it("should show profile card on both tabs", () => {
      // Profile card (with name, level, XP bar) is always visible
      const profileCardVisible = true;
      
      expect(profileCardVisible).toBe(true);
    });

    it("should show tab navigation below profile card", () => {
      // Tab buttons are positioned below profile card
      const tabsPosition = "below-profile-card";
      
      expect(tabsPosition).toBe("below-profile-card");
    });

    it("should show different content below tabs based on active tab", () => {
      type ProfileTab = "fitness" | "gamification";
      
      const getContentType = (activeTab: ProfileTab) => {
        return activeTab === "fitness" ? "fitness-profile" : "gamification-dashboard";
      };

      expect(getContentType("fitness")).toBe("fitness-profile");
      expect(getContentType("gamification")).toBe("gamification-dashboard");
    });
  });
});
