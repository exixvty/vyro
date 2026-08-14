ALTER TABLE `activity_feed` ADD `audience` enum('public','friends','private') DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE `activity_feed` ADD `privateNotes` text;