CREATE TABLE `pets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`species` varchar(50) NOT NULL,
	`breed` varchar(100),
	`personality` text,
	`likes` text,
	`dislikes` text,
	`originalImageUrl` varchar(500) NOT NULL,
	`pfpImageUrl` varchar(500),
	`nftTokenId` int,
	`nftContractAddress` varchar(42),
	`nftTransactionHash` varchar(66),
	`voteCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`petId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `votes_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_pet_unique` UNIQUE(`userId`,`petId`)
);
