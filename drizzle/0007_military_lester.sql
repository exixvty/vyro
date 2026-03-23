CREATE TABLE `beast_mode` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`isActive` boolean NOT NULL DEFAULT false,
	`activatedAt` timestamp,
	`deactivatedAt` timestamp,
	`totalActivations` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `beast_mode_id` PRIMARY KEY(`id`),
	CONSTRAINT `beast_mode_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `daily_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`workoutCompleted` boolean NOT NULL DEFAULT false,
	`mealsLogged` boolean NOT NULL DEFAULT false,
	`activityCompleted` boolean NOT NULL DEFAULT false,
	`allGoalsCompletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `login_streaks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`currentStreak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`lastLoginDate` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `login_streaks_id` PRIMARY KEY(`id`),
	CONSTRAINT `login_streaks_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `progress_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`photoUrl` text NOT NULL,
	`angle` enum('front','side','back') NOT NULL,
	`date` timestamp NOT NULL DEFAULT (now()),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `progress_photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`achievementType` enum('first_workout','seven_day_streak','first_level_up','ten_workouts','fifty_workouts','first_meal_log','first_progress_photo','beast_mode_activated') NOT NULL,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_xp` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalXP` int NOT NULL DEFAULT 0,
	`currentLevel` int NOT NULL DEFAULT 1,
	`currentTier` enum('Rookie','Prospect','Athlete','Beast','Elite','Legend') NOT NULL DEFAULT 'Rookie',
	`lastLevelUpAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_xp_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_xp_userId_unique` UNIQUE(`userId`)
);
