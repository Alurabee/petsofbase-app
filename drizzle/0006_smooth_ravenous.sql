CREATE TABLE `activityFeed` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`petId` int,
	`activityType` enum('generation','mint','vote','top10') NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activityFeed_id` PRIMARY KEY(`id`)
);
