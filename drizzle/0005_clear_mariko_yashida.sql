CREATE TABLE `petOfTheDay` (
	`id` int AUTO_INCREMENT NOT NULL,
	`petId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`voteCount` int NOT NULL DEFAULT 0,
	`prizeAwarded` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `petOfTheDay_id` PRIMARY KEY(`id`),
	CONSTRAINT `petOfTheDay_date_unique` UNIQUE(`date`)
);
--> statement-breakpoint
CREATE TABLE `petOfTheDayVotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`petOfTheDayId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `petOfTheDayVotes_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_day_unique` UNIQUE(`userId`,`petOfTheDayId`)
);
