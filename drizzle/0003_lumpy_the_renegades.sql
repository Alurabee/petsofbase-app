CREATE TABLE `pfpVersions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`petId` int NOT NULL,
	`imageUrl` varchar(500) NOT NULL,
	`prompt` text,
	`isSelected` int NOT NULL DEFAULT 0,
	`generationNumber` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pfpVersions_id` PRIMARY KEY(`id`)
);
