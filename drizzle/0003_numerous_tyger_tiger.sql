CREATE TABLE `referral_signups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referralCodeId` int NOT NULL,
	`newUserId` int NOT NULL,
	`referrerId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referral_signups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `referral_codes` ADD `rewardClaimedAt` timestamp;