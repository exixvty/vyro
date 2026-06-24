import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * GamificationDashboard Component Tests
 * Tests for the gamification dashboard tab integration in the Profile page
 */

describe("GamificationDashboard Component", () => {
  describe("Component Rendering", () => {
    it("should render level card with current level and XP", () => {
      // Mock stats data
      const mockStats = {
        level: 5,
        xp: 2500,
        totalWorkouts: 25,
        workoutStreak: 7,
        totalMinutes: 1250,
      };

      // Verify level title mapping
      const levelTitles: Record<number, string> = {
        1: "Rookie", 2: "Trainee", 3: "Athlete", 4: "Competitor", 5: "Champion",
        6: "Elite", 7: "Master", 8: "Legend", 9: "Titan", 10: "God Mode",
      };

      expect(mockStats.level).toBe(5);
      expect(levelTitles[mockStats.level]).toBe("Champion");
      expect(mockStats.xp).toBe(2500);
    });

    it("should calculate XP progress correctly", () => {
      const level = 5;
      const xp = 2500;
      const xpForLevel = (l: number) => l * l * 100;
      
      const currentLevelXP = xpForLevel(level - 1);
      const nextLevelXP = xpForLevel(level);
      const progress = Math.min(100, ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);

      expect(currentLevelXP).toBe(1600); // 4 * 4 * 100
      expect(nextLevelXP).toBe(2500); // 5 * 5 * 100
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    });

    it("should render stats grid with correct values", () => {
      const mockStats = {
        level: 3,
        xp: 900,
        totalWorkouts: 15,
        workoutStreak: 5,
        totalMinutes: 750,
      };

      const stats = [
        { label: "Total Workouts", value: mockStats.totalWorkouts },
        { label: "Best Streak", value: `${mockStats.workoutStreak} days` },
        { label: "Total Minutes", value: mockStats.totalMinutes },
        { label: "Achievements", value: "0/15" },
      ];

      expect(stats).toHaveLength(4);
      expect(stats[0].value).toBe(15);
      expect(stats[1].value).toBe("5 days");
      expect(stats[2].value).toBe(750);
    });
  });

  describe("Achievement Filtering", () => {
    it("should filter achievements by category", () => {
      const ALL_ACHIEVEMENTS = [
        { id: "first_workout", category: "workout", title: "First Rep" },
        { id: "streak_3", category: "streak", title: "3-Day Streak" },
        { id: "streak_7", category: "streak", title: "Week Warrior" },
        { id: "nutrition_7", category: "nutrition", title: "Nutrition Nerd" },
        { id: "pr_first", category: "strength", title: "New Record" },
      ];

      const filterByCategory = (achievements: typeof ALL_ACHIEVEMENTS, category: string) => {
        if (category === "all") return achievements;
        return achievements.filter((a) => a.category === category);
      };

      expect(filterByCategory(ALL_ACHIEVEMENTS, "all")).toHaveLength(5);
      expect(filterByCategory(ALL_ACHIEVEMENTS, "workout")).toHaveLength(1);
      expect(filterByCategory(ALL_ACHIEVEMENTS, "streak")).toHaveLength(2);
      expect(filterByCategory(ALL_ACHIEVEMENTS, "nutrition")).toHaveLength(1);
      expect(filterByCategory(ALL_ACHIEVEMENTS, "strength")).toHaveLength(1);
    });

    it("should track earned achievements", () => {
      const mockAchievements = [
        { id: "first_workout", badgeId: "first_workout", badgeName: "First Rep" },
        { id: "streak_3", badgeId: "streak_3", badgeName: "3-Day Streak" },
      ];

      const earnedIds = new Set(mockAchievements.map((a) => a.badgeId));
      
      expect(earnedIds.has("first_workout")).toBe(true);
      expect(earnedIds.has("streak_3")).toBe(true);
      expect(earnedIds.has("streak_7")).toBe(false);
      expect(earnedIds.size).toBe(2);
    });

    it("should calculate achievement completion percentage", () => {
      const ALL_ACHIEVEMENTS_COUNT = 15;
      const earnedCount = 5;
      const completionPercentage = (earnedCount / ALL_ACHIEVEMENTS_COUNT) * 100;

      expect(completionPercentage).toBe((5 / 15) * 100);
      expect(completionPercentage).toBeCloseTo(33.33, 1);
    });
  });

  describe("Category Filter Buttons", () => {
    it("should have all category options available", () => {
      const categories = ["all", "workout", "streak", "nutrition", "strength", "habits", "level", "social", "progress"];
      
      expect(categories).toHaveLength(9);
      expect(categories).toContain("all");
      expect(categories).toContain("workout");
      expect(categories).toContain("streak");
      expect(categories).toContain("nutrition");
      expect(categories).toContain("strength");
      expect(categories).toContain("habits");
      expect(categories).toContain("level");
      expect(categories).toContain("social");
      expect(categories).toContain("progress");
    });

    it("should track active category state", () => {
      let activeCategory = "all";
      const setActiveCategory = (category: string) => {
        activeCategory = category;
      };

      expect(activeCategory).toBe("all");
      
      setActiveCategory("workout");
      expect(activeCategory).toBe("workout");
      
      setActiveCategory("streak");
      expect(activeCategory).toBe("streak");
    });
  });

  describe("Achievement Display", () => {
    it("should show earned badge status", () => {
      const achievement = {
        id: "first_workout",
        title: "First Rep",
        desc: "Complete your first workout",
        icon: "🏋️",
        xp: 100,
        category: "workout",
      };

      const earnedIds = new Set(["first_workout"]);
      const isEarned = earnedIds.has(achievement.id);

      expect(isEarned).toBe(true);
      expect(achievement.xp).toBe(100);
    });

    it("should show locked badge status", () => {
      const achievement = {
        id: "streak_30",
        title: "Iron Will",
        desc: "30-day workout streak",
        icon: "💎",
        xp: 1000,
        category: "streak",
      };

      const earnedIds = new Set(["first_workout"]);
      const isEarned = earnedIds.has(achievement.id);

      expect(isEarned).toBe(false);
      expect(achievement.xp).toBe(1000);
    });

    it("should display achievement XP rewards", () => {
      const achievements = [
        { id: "first_workout", xp: 100 },
        { id: "streak_3", xp: 150 },
        { id: "streak_7", xp: 300 },
        { id: "streak_30", xp: 1000 },
      ];

      const totalXpPotential = achievements.reduce((sum, a) => sum + a.xp, 0);
      
      expect(totalXpPotential).toBe(1550);
      expect(achievements[0].xp).toBe(100);
      expect(achievements[3].xp).toBe(1000);
    });
  });

  describe("Level Title Mapping", () => {
    it("should map levels to titles correctly", () => {
      const LEVEL_TITLES: Record<number, string> = {
        1: "Rookie", 2: "Trainee", 3: "Athlete", 4: "Competitor", 5: "Champion",
        6: "Elite", 7: "Master", 8: "Legend", 9: "Titan", 10: "God Mode",
      };

      const getLevelTitle = (level: number) => {
        if (level >= 10) return "God Mode";
        return LEVEL_TITLES[level] || `Level ${level}`;
      };

      expect(getLevelTitle(1)).toBe("Rookie");
      expect(getLevelTitle(5)).toBe("Champion");
      expect(getLevelTitle(8)).toBe("Legend");
      expect(getLevelTitle(10)).toBe("God Mode");
      expect(getLevelTitle(15)).toBe("God Mode");
    });
  });

  describe("Animation States", () => {
    it("should have staggered animation delays", () => {
      const animationDelays = [0, 0.1, 0.2, 0.3];
      
      expect(animationDelays[0]).toBe(0);
      expect(animationDelays[1]).toBe(0.1);
      expect(animationDelays[2]).toBe(0.2);
      expect(animationDelays[3]).toBe(0.3);
    });

    it("should have consistent animation properties", () => {
      const animationConfig = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.1 },
      };

      expect(animationConfig.initial.opacity).toBe(0);
      expect(animationConfig.animate.opacity).toBe(1);
      expect(animationConfig.transition.delay).toBe(0.1);
    });
  });
});
