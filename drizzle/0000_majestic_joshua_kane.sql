CREATE TABLE "activityFeed" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"petId" integer,
	"activityType" "activityType" NOT NULL,
	"metadata" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"icon" varchar(10) NOT NULL,
	"description" text NOT NULL,
	"tier" "tier" NOT NULL,
	"criteria" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "petOfTheDay" (
	"id" serial PRIMARY KEY NOT NULL,
	"petId" integer NOT NULL,
	"date" varchar(10) NOT NULL,
	"voteCount" integer DEFAULT 0 NOT NULL,
	"prizeAwarded" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "petOfTheDay_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "petOfTheDayVotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"petOfTheDayId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pets" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"ownerFid" integer,
	"ownerUsername" varchar(255),
	"ownerDisplayName" varchar(255),
	"ownerPfpUrl" varchar(500),
	"name" varchar(100) NOT NULL,
	"species" varchar(50) NOT NULL,
	"breed" varchar(100),
	"personality" text,
	"likes" text,
	"dislikes" text,
	"originalImageUrl" varchar(500) NOT NULL,
	"pfpImageUrl" varchar(500),
	"generationCount" integer DEFAULT 0 NOT NULL,
	"nftTokenId" integer,
	"nftContractAddress" varchar(42),
	"nftTransactionHash" varchar(66),
	"voteCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pfpVersions" (
	"id" serial PRIMARY KEY NOT NULL,
	"petId" integer NOT NULL,
	"imageUrl" varchar(500) NOT NULL,
	"prompt" text,
	"isSelected" integer DEFAULT 0 NOT NULL,
	"generationNumber" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" serial PRIMARY KEY NOT NULL,
	"referrerId" integer NOT NULL,
	"referredUserId" integer,
	"referralCode" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"rewardGranted" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"completedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "userBadges" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"petId" integer,
	"badgeId" integer NOT NULL,
	"earnedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userReferralStats" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"referralCode" varchar(50) NOT NULL,
	"totalReferrals" integer DEFAULT 0 NOT NULL,
	"pendingReferrals" integer DEFAULT 0 NOT NULL,
	"freeGenerationsEarned" integer DEFAULT 0 NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "userReferralStats_userId_unique" UNIQUE("userId"),
	CONSTRAINT "userReferralStats_referralCode_unique" UNIQUE("referralCode")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"petId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weeklyDraw" (
	"id" serial PRIMARY KEY NOT NULL,
	"weekStartDate" varchar(10) NOT NULL,
	"winningPetId" integer NOT NULL,
	"winningPetOfTheDayId" integer NOT NULL,
	"prizeAmount" integer DEFAULT 5 NOT NULL,
	"prizeAwarded" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "weeklyDraw_weekStartDate_unique" UNIQUE("weekStartDate")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "user_day_unique" ON "petOfTheDayVotes" USING btree ("userId","petOfTheDayId");--> statement-breakpoint
CREATE UNIQUE INDEX "referral_code_unique" ON "referrals" USING btree ("referralCode");--> statement-breakpoint
CREATE UNIQUE INDEX "user_pet_badge_unique" ON "userBadges" USING btree ("userId","petId","badgeId");--> statement-breakpoint
CREATE UNIQUE INDEX "user_pet_unique" ON "votes" USING btree ("userId","petId");