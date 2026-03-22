CREATE TABLE `exercises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` enum('chest','back','shoulders','biceps','triceps','forearms','legs','glutes','core','cardio','functional') NOT NULL,
	`type` enum('compound','isolation','cardio','functional') NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL,
	`equipment` json NOT NULL,
	`description` text,
	`muscleGroups` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exercises_id` PRIMARY KEY(`id`),
	CONSTRAINT `exercises_name_unique` UNIQUE(`name`)
);
