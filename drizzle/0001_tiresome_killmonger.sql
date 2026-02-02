CREATE TABLE `audit_trail` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`analysisId` int,
	`action` varchar(256) NOT NULL,
	`actionType` enum('create','read','update','delete','verify','synthesize','export') NOT NULL,
	`resourceType` varchar(128) NOT NULL,
	`resourceId` int,
	`details` text,
	`resultStatus` enum('success','partial','failed') NOT NULL DEFAULT 'success',
	`cryptographicHash` varchar(256),
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_trail_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `branding_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`brand` varchar(128) NOT NULL,
	`displayName` varchar(256) NOT NULL,
	`description` text,
	`primaryColor` varchar(7) DEFAULT '#000000',
	`secondaryColor` varchar(7) DEFAULT '#FFFFFF',
	`accentColor` varchar(7) DEFAULT '#0066CC',
	`logoUrl` varchar(512),
	`tagline` varchar(256),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `branding_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `branding_config_brand_unique` UNIQUE(`brand`),
	CONSTRAINT `brand_idx` UNIQUE(`brand`)
);
--> statement-breakpoint
CREATE TABLE `evidence_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analysisId` int NOT NULL,
	`sourceUrl` varchar(512) NOT NULL,
	`sourceTitle` varchar(512),
	`sourceType` enum('article','report','data','research','news','social_media','other') NOT NULL,
	`verificationStatus` enum('unverified','pending','verified','disputed') NOT NULL DEFAULT 'unverified',
	`confidenceScore` decimal(3,2) DEFAULT '0.00',
	`keyInsight` text,
	`evidenceSnippet` text,
	`publicationDate` timestamp,
	`retrievalDate` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `evidence_sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `strategic_analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`nodeId` int NOT NULL,
	`analysisType` enum('gcr_loop','verification','synthesis','validation') NOT NULL,
	`status` enum('pending','running','completed','failed') NOT NULL DEFAULT 'pending',
	`lambdaScore` decimal(3,2) DEFAULT '0.00',
	`e8Metric` decimal(5,4) DEFAULT '0.0000',
	`recursionDepth` int DEFAULT 0,
	`correctionVectorNull` boolean DEFAULT false,
	`generatorOutput` text,
	`criticOutput` text,
	`synthesisResult` text,
	`confidenceScore` decimal(3,2) DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `strategic_analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `strategic_insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analysisId` int NOT NULL,
	`insightType` enum('threat','opportunity','weakness','strength','recommendation') NOT NULL,
	`title` varchar(512) NOT NULL,
	`description` text NOT NULL,
	`impactScore` decimal(3,2) DEFAULT '0.00',
	`actionability` enum('immediate','short_term','medium_term','long_term','strategic') NOT NULL DEFAULT 'strategic',
	`recommendedActions` text,
	`relatedNodes` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `strategic_insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `strategic_projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`description` text,
	`brand` varchar(128) NOT NULL DEFAULT 'AxiomHive',
	`status` enum('active','archived','completed','paused') NOT NULL DEFAULT 'active',
	`targetType` enum('competitor','market','technology','threat','opportunity') NOT NULL,
	`targetName` varchar(256) NOT NULL,
	`confidenceLevel` decimal(3,2) DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `strategic_projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `targeted_adversarial_nodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`nodeType` varchar(128) NOT NULL,
	`nodeIdentifier` varchar(256) NOT NULL,
	`description` text,
	`threatLevel` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`opportunityScore` decimal(3,2) DEFAULT '0.00',
	`selfDefeatProbability` decimal(3,2) DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `targeted_adversarial_nodes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `verification_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analysisId` int NOT NULL,
	`verificationMethod` varchar(256) NOT NULL,
	`lambdaTarget` decimal(3,2) DEFAULT '1.00',
	`lambdaAchieved` decimal(3,2) DEFAULT '0.00',
	`e8Target` decimal(5,4) DEFAULT '0.0000',
	`e8Achieved` decimal(5,4) DEFAULT '0.0000',
	`verificationStatus` enum('pending','passed','failed','partial') NOT NULL DEFAULT 'pending',
	`verificationDetails` text,
	`cryptographicProof` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `verification_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','strategist','analyst') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `brand` varchar(128) DEFAULT 'AxiomHive' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `custodialIdentity` varchar(256);--> statement-breakpoint
ALTER TABLE `users` ADD `verificationStatus` enum('unverified','pending','verified','trusted') DEFAULT 'unverified' NOT NULL;--> statement-breakpoint
ALTER TABLE `audit_trail` ADD CONSTRAINT `audit_trail_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_trail` ADD CONSTRAINT `audit_trail_projectId_strategic_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `strategic_projects`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_trail` ADD CONSTRAINT `audit_trail_analysisId_strategic_analyses_id_fk` FOREIGN KEY (`analysisId`) REFERENCES `strategic_analyses`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `evidence_sources` ADD CONSTRAINT `evidence_sources_analysisId_strategic_analyses_id_fk` FOREIGN KEY (`analysisId`) REFERENCES `strategic_analyses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `strategic_analyses` ADD CONSTRAINT `strategic_analyses_projectId_strategic_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `strategic_projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `strategic_analyses` ADD CONSTRAINT `strategic_analyses_nodeId_targeted_adversarial_nodes_id_fk` FOREIGN KEY (`nodeId`) REFERENCES `targeted_adversarial_nodes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `strategic_insights` ADD CONSTRAINT `strategic_insights_analysisId_strategic_analyses_id_fk` FOREIGN KEY (`analysisId`) REFERENCES `strategic_analyses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `strategic_projects` ADD CONSTRAINT `strategic_projects_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `targeted_adversarial_nodes` ADD CONSTRAINT `targeted_adversarial_nodes_projectId_strategic_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `strategic_projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `verification_records` ADD CONSTRAINT `verification_records_analysisId_strategic_analyses_id_fk` FOREIGN KEY (`analysisId`) REFERENCES `strategic_analyses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `audit_trail` (`userId`);--> statement-breakpoint
CREATE INDEX `project_id_idx` ON `audit_trail` (`projectId`);--> statement-breakpoint
CREATE INDEX `analysis_id_idx` ON `audit_trail` (`analysisId`);--> statement-breakpoint
CREATE INDEX `action_type_idx` ON `audit_trail` (`actionType`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `audit_trail` (`createdAt`);--> statement-breakpoint
CREATE INDEX `analysis_id_idx` ON `evidence_sources` (`analysisId`);--> statement-breakpoint
CREATE INDEX `verification_status_idx` ON `evidence_sources` (`verificationStatus`);--> statement-breakpoint
CREATE INDEX `project_id_idx` ON `strategic_analyses` (`projectId`);--> statement-breakpoint
CREATE INDEX `node_id_idx` ON `strategic_analyses` (`nodeId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `strategic_analyses` (`status`);--> statement-breakpoint
CREATE INDEX `lambda_score_idx` ON `strategic_analyses` (`lambdaScore`);--> statement-breakpoint
CREATE INDEX `analysis_id_idx` ON `strategic_insights` (`analysisId`);--> statement-breakpoint
CREATE INDEX `insight_type_idx` ON `strategic_insights` (`insightType`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `strategic_projects` (`userId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `strategic_projects` (`status`);--> statement-breakpoint
CREATE INDEX `brand_idx` ON `strategic_projects` (`brand`);--> statement-breakpoint
CREATE INDEX `project_id_idx` ON `targeted_adversarial_nodes` (`projectId`);--> statement-breakpoint
CREATE INDEX `threat_level_idx` ON `targeted_adversarial_nodes` (`threatLevel`);--> statement-breakpoint
CREATE INDEX `analysis_id_idx` ON `verification_records` (`analysisId`);--> statement-breakpoint
CREATE INDEX `verification_status_idx` ON `verification_records` (`verificationStatus`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `brand_idx` ON `users` (`brand`);