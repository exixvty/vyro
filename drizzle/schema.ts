import {
  boolean,
  float,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── User Profiles ────────────────────────────────────────────────────────────
export const userProfiles = mysqlTable("user_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  avatarUrl: text("avatarUrl"),
  bio: text("bio"),
  // Onboarding data
  age: int("age"),
  heightCm: float("heightCm"),
  weightKg: float("weightKg"),
  fitnessLevel: mysqlEnum("fitnessLevel", ["beginner", "intermediate", "advanced", "athlete"]),
  primaryGoal: mysqlEnum("primaryGoal", ["fat_loss", "lean_bulk", "muscle_gain", "athlete_performance", "general_fitness"]),
  athleteType: mysqlEnum("athleteType", ["bodybuilder", "footballer", "runner", "swimmer", "basketball", "general"]),
  // Preferences
  unitSystem: mysqlEnum("unitSystem", ["metric", "imperial"]).default("metric").notNull(),
  themeMode: mysqlEnum("themeMode", ["dark", "light", "system"]).default("dark").notNull(),
  accentColor: varchar("accentColor", { length: 20 }).default("violet").notNull(),
  onboardingCompleted: boolean("onboardingCompleted").default(false).notNull(),
  isPremium: boolean("isPremium").default(false).notNull(),
  premiumExpiresAt: timestamp("premiumExpiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

// ─── Workouts ─────────────────────────────────────────────────────────────────
export const workoutPlans = mysqlTable("workout_plans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["ai_generated", "custom", "template"]).default("ai_generated").notNull(),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).default("intermediate").notNull(),
  durationWeeks: int("durationWeeks").default(4),
  daysPerWeek: int("daysPerWeek").default(3),
  exercises: json("exercises"), // Array of exercise objects
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type InsertWorkoutPlan = typeof workoutPlans.$inferInsert;

export const workoutSessions = mysqlTable("workout_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planId: int("planId"),
  title: varchar("title", { length: 200 }).notNull(),
  type: mysqlEnum("type", ["strength", "cardio", "hiit", "flexibility", "sport"]).default("strength").notNull(),
  durationMinutes: int("durationMinutes"),
  caloriesBurned: int("caloriesBurned"),
  exercises: json("exercises"), // Completed exercises with sets/reps/weights
  notes: text("notes"),
  rating: int("rating"), // 1-5
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type InsertWorkoutSession = typeof workoutSessions.$inferInsert;

// ─── Nutrition ────────────────────────────────────────────────────────────────
export const nutritionLogs = mysqlTable("nutrition_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  logDate: varchar("logDate", { length: 10 }).notNull(), // YYYY-MM-DD
  mealType: mysqlEnum("mealType", ["breakfast", "lunch", "dinner", "snack"]).notNull(),
  foodName: varchar("foodName", { length: 200 }).notNull(),
  calories: float("calories").notNull(),
  proteinG: float("proteinG").default(0),
  carbsG: float("carbsG").default(0),
  fatG: float("fatG").default(0),
  servingSize: varchar("servingSize", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NutritionLog = typeof nutritionLogs.$inferSelect;
export type InsertNutritionLog = typeof nutritionLogs.$inferInsert;

export const nutritionGoals = mysqlTable("nutrition_goals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  dailyCalories: int("dailyCalories").default(2000).notNull(),
  proteinG: int("proteinG").default(150).notNull(),
  carbsG: int("carbsG").default(200).notNull(),
  fatG: int("fatG").default(65).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NutritionGoal = typeof nutritionGoals.$inferSelect;

// ─── Progress ─────────────────────────────────────────────────────────────────
export const progressEntries = mysqlTable("progress_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  entryDate: varchar("entryDate", { length: 10 }).notNull(), // YYYY-MM-DD
  weightKg: float("weightKg"),
  bodyFatPct: float("bodyFatPct"),
  chestCm: float("chestCm"),
  waistCm: float("waistCm"),
  hipsCm: float("hipsCm"),
  armCm: float("armCm"),
  thighCm: float("thighCm"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProgressEntry = typeof progressEntries.$inferSelect;
export type InsertProgressEntry = typeof progressEntries.$inferInsert;

export const personalRecords = mysqlTable("personal_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  exerciseName: varchar("exerciseName", { length: 200 }).notNull(),
  value: float("value").notNull(),
  unit: varchar("unit", { length: 20 }).default("kg").notNull(),
  recordDate: varchar("recordDate", { length: 10 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PersonalRecord = typeof personalRecords.$inferSelect;

// ─── Habits ───────────────────────────────────────────────────────────────────
export const habits = mysqlTable("habits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  icon: varchar("icon", { length: 50 }).default("check").notNull(),
  color: varchar("color", { length: 20 }).default("violet").notNull(),
  targetDays: json("targetDays"), // [0,1,2,3,4,5,6] days of week
  reminderTime: varchar("reminderTime", { length: 5 }), // HH:MM
  currentStreak: int("currentStreak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Habit = typeof habits.$inferSelect;
export type InsertHabit = typeof habits.$inferInsert;

export const habitCompletions = mysqlTable("habit_completions", {
  id: int("id").autoincrement().primaryKey(),
  habitId: int("habitId").notNull(),
  userId: int("userId").notNull(),
  completedDate: varchar("completedDate", { length: 10 }).notNull(), // YYYY-MM-DD
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HabitCompletion = typeof habitCompletions.$inferSelect;

// ─── Gamification ─────────────────────────────────────────────────────────────
export const userGameStats = mysqlTable("user_game_stats", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  xp: int("xp").default(0).notNull(),
  level: int("level").default(1).notNull(),
  totalWorkouts: int("totalWorkouts").default(0).notNull(),
  totalMinutes: int("totalMinutes").default(0).notNull(),
  workoutStreak: int("workoutStreak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserGameStats = typeof userGameStats.$inferSelect;

export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  badgeId: varchar("badgeId", { length: 100 }).notNull(),
  badgeName: varchar("badgeName", { length: 200 }).notNull(),
  badgeIcon: varchar("badgeIcon", { length: 50 }).notNull(),
  xpReward: int("xpReward").default(0).notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;

// ─── Social ───────────────────────────────────────────────────────────────────
export const activityFeed = mysqlTable("activity_feed", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["workout_completed", "achievement_earned", "pr_set", "streak_milestone", "joined"]).notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  metadata: json("metadata"),
  likesCount: int("likesCount").default(0).notNull(),
  isPublic: boolean("isPublic").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityFeedItem = typeof activityFeed.$inferSelect;

export const follows = mysqlTable("follows", {
  id: int("id").autoincrement().primaryKey(),
  followerId: int("followerId").notNull(),
  followingId: int("followingId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const feedLikes = mysqlTable("feed_likes", {
  id: int("id").autoincrement().primaryKey(),
  feedItemId: int("feedItemId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
