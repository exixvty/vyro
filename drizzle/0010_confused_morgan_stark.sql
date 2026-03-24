CREATE TABLE `recovery_motivations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`message` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recovery_motivations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `urge_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`addictionId` int NOT NULL,
	`intensity` int NOT NULL,
	`trigger` varchar(200),
	`copingStrategy` varchar(200),
	`overcame` boolean NOT NULL DEFAULT true,
	`loggedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `urge_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_addictions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`addictionType` varchar(100) NOT NULL,
	`addictionLabel` varchar(150) NOT NULL,
	`sobrietyStartDate` timestamp NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_addictions_id` PRIMARY KEY(`id`)
);
