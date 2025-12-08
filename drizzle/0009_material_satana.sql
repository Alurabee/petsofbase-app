CREATE TABLE `activityFeed` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`petId` int,
	`activityType` enum('generation','mint','vote','top10') NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activityFeed_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
--> statement-breakpoint
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
	`generationCount` int NOT NULL DEFAULT 0,
	`nftTokenId` int,
	`nftContractAddress` varchar(42),
	`nftTransactionHash` varchar(66),
	`voteCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`referredUserId` int,
	`referralCode` varchar(50) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`rewardGranted` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referral_code_unique` UNIQUE(`referralCode`)
);
--> statement-breakpoint
CREATE TABLE `userReferralStats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`referralCode` varchar(50) NOT NULL,
	`totalReferrals` int NOT NULL DEFAULT 0,
	`pendingReferrals` int NOT NULL DEFAULT 0,
	`freeGenerationsEarned` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userReferralStats_id` PRIMARY KEY(`id`),
	CONSTRAINT `userReferralStats_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `userReferralStats_referralCode_unique` UNIQUE(`referralCode`)
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
--> statement-breakpoint
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
