CREATE TABLE `theme_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`primaryColor` varchar(20) NOT NULL DEFAULT 'violet',
	`accentColor` varchar(20) NOT NULL DEFAULT 'cyan',
	`secondaryColor` varchar(20) NOT NULL DEFAULT 'pink',
	`buttonStyle` enum('solid','outline','gradient','glassmorphism') NOT NULL DEFAULT 'solid',
	`fontFamily` enum('inter','space-grotesk','syne','poppins','roboto') NOT NULL DEFAULT 'inter',
	`appName` varchar(100) NOT NULL DEFAULT 'VYRO',
	`logoUrl` text,
	`presetTheme` enum('custom','neon','sunset','ocean','forest','cyberpunk') NOT NULL DEFAULT 'custom',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `theme_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `theme_preferences_userId_unique` UNIQUE(`userId`)
);
