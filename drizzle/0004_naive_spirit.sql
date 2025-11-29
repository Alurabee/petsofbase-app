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
