CREATE TABLE `referral_devices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`deviceId` varchar(255) NOT NULL,
	`deviceName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referral_devices_id` PRIMARY KEY(`id`),
	CONSTRAINT `referral_devices_deviceId_unique` UNIQUE(`deviceId`)
);
--> statement-breakpoint
ALTER TABLE `referral_codes` ADD `validSignups` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `referral_codes` ADD `tier3ClaimedAt` timestamp;--> statement-breakpoint
ALTER TABLE `referral_codes` ADD `tier5ClaimedAt` timestamp;--> statement-breakpoint
ALTER TABLE `referral_codes` ADD `tier10ClaimedAt` timestamp;--> statement-breakpoint
ALTER TABLE `referral_signups` ADD `deviceId` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `referral_signups` ADD `ipHash` varchar(255);--> statement-breakpoint
ALTER TABLE `referral_signups` ADD `isValid` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `referral_signups` ADD `validatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `referral_codes` DROP COLUMN `rewardClaimedAt`;