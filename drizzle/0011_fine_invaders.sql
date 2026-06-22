ALTER TABLE `notification_settings` ADD `sobrietyReminder` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `notification_settings` ADD `sobrietyReminderTime` varchar(5) DEFAULT '09:00' NOT NULL;--> statement-breakpoint
ALTER TABLE `notification_settings` ADD `cravingAlertEnabled` boolean DEFAULT true NOT NULL;