CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`badgeId` varchar(100) NOT NULL,
	`badgeName` varchar(200) NOT NULL,
	`badgeIcon` varchar(50) NOT NULL,
	`xpReward` int NOT NULL DEFAULT 0,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `activity_feed` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('workout_completed','achievement_earned','pr_set','streak_milestone','joined') NOT NULL,
	`title` varchar(300) NOT NULL,
	`description` text,
	`metadata` json,
	`likesCount` int NOT NULL DEFAULT 0,
	`isPublic` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_feed_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feed_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`feedItemId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feed_likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `follows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`followerId` int NOT NULL,
	`followingId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `follows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `habit_completions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`habitId` int NOT NULL,
	`userId` int NOT NULL,
	`completedDate` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `habit_completions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `habits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`icon` varchar(50) NOT NULL DEFAULT 'check',
	`color` varchar(20) NOT NULL DEFAULT 'violet',
	`targetDays` json,
	`reminderTime` varchar(5),
	`currentStreak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `habits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nutrition_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dailyCalories` int NOT NULL DEFAULT 2000,
	`proteinG` int NOT NULL DEFAULT 150,
	`carbsG` int NOT NULL DEFAULT 200,
	`fatG` int NOT NULL DEFAULT 65,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `nutrition_goals_id` PRIMARY KEY(`id`),
	CONSTRAINT `nutrition_goals_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `nutrition_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`logDate` varchar(10) NOT NULL,
	`mealType` enum('breakfast','lunch','dinner','snack') NOT NULL,
	`foodName` varchar(200) NOT NULL,
	`calories` float NOT NULL,
	`proteinG` float DEFAULT 0,
	`carbsG` float DEFAULT 0,
	`fatG` float DEFAULT 0,
	`servingSize` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `nutrition_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `personal_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exerciseName` varchar(200) NOT NULL,
	`value` float NOT NULL,
	`unit` varchar(20) NOT NULL DEFAULT 'kg',
	`recordDate` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `personal_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `progress_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`entryDate` varchar(10) NOT NULL,
	`weightKg` float,
	`bodyFatPct` float,
	`chestCm` float,
	`waistCm` float,
	`hipsCm` float,
	`armCm` float,
	`thighCm` float,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `progress_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_game_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`xp` int NOT NULL DEFAULT 0,
	`level` int NOT NULL DEFAULT 1,
	`totalWorkouts` int NOT NULL DEFAULT 0,
	`totalMinutes` int NOT NULL DEFAULT 0,
	`workoutStreak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_game_stats_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_game_stats_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`avatarUrl` text,
	`bio` text,
	`age` int,
	`heightCm` float,
	`weightKg` float,
	`fitnessLevel` enum('beginner','intermediate','advanced','athlete'),
	`primaryGoal` enum('fat_loss','lean_bulk','muscle_gain','athlete_performance','general_fitness'),
	`athleteType` enum('bodybuilder','footballer','runner','swimmer','basketball','general'),
	`unitSystem` enum('metric','imperial') NOT NULL DEFAULT 'metric',
	`themeMode` enum('dark','light','system') NOT NULL DEFAULT 'dark',
	`accentColor` varchar(20) NOT NULL DEFAULT 'violet',
	`onboardingCompleted` boolean NOT NULL DEFAULT false,
	`isPremium` boolean NOT NULL DEFAULT false,
	`premiumExpiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `workout_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`type` enum('ai_generated','custom','template') NOT NULL DEFAULT 'ai_generated',
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL DEFAULT 'intermediate',
	`durationWeeks` int DEFAULT 4,
	`daysPerWeek` int DEFAULT 3,
	`exercises` json,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workout_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workout_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planId` int,
	`title` varchar(200) NOT NULL,
	`type` enum('strength','cardio','hiit','flexibility','sport') NOT NULL DEFAULT 'strength',
	`durationMinutes` int,
	`caloriesBurned` int,
	`exercises` json,
	`notes` text,
	`rating` int,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workout_sessions_id` PRIMARY KEY(`id`)
);
