CREATE TABLE `workout_exercise_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workoutSessionId` int NOT NULL,
	`exerciseId` int NOT NULL,
	`order` int NOT NULL,
	`superset` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workout_exercise_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workout_sets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workoutExerciseLogId` int NOT NULL,
	`setNumber` int NOT NULL,
	`reps` int,
	`weight` float,
	`weightUnit` enum('kg','lbs') NOT NULL DEFAULT 'kg',
	`duration` int,
	`distance` float,
	`distanceUnit` enum('km','miles') NOT NULL DEFAULT 'km',
	`rpe` int,
	`notes` text,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workout_sets_id` PRIMARY KEY(`id`)
);
