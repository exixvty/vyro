CREATE TABLE `notification_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`workoutReminder` boolean NOT NULL DEFAULT true,
	`workoutReminderTime` varchar(5) NOT NULL DEFAULT '09:00',
	`habitReminder` boolean NOT NULL DEFAULT true,
	`habitReminderTime` varchar(5) NOT NULL DEFAULT '20:00',
	`streakAlert` boolean NOT NULL DEFAULT true,
	`levelUpAlert` boolean NOT NULL DEFAULT true,
	`achievementAlert` boolean NOT NULL DEFAULT true,
	`weeklySummary` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_settings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `push_subscriptions_id` PRIMARY KEY(`id`)
);
