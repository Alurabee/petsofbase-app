CREATE TABLE `weeklyDraw` (
	`id` int AUTO_INCREMENT NOT NULL,
	`weekStartDate` varchar(10) NOT NULL,
	`winningPetId` int NOT NULL,
	`winningPetOfTheDayId` int NOT NULL,
	`prizeAmount` int NOT NULL DEFAULT 5,
	`prizeAwarded` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weeklyDraw_id` PRIMARY KEY(`id`),
	CONSTRAINT `weeklyDraw_weekStartDate_unique` UNIQUE(`weekStartDate`)
);
