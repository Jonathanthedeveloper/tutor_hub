CREATE TABLE `account` (
	`id` varchar(36) NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp(3),
	`refresh_token_expires_at` timestamp(3),
	`scope` text,
	`password` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(36) NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` varchar(36) NOT NULL,
	`impersonated_by` text,
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`image` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	`role` text,
	`banned` boolean DEFAULT false,
	`ban_reason` text,
	`ban_expires` timestamp(3),
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(36) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `class_session` (
	`id` varchar(36) NOT NULL,
	`course_id` varchar(36) NOT NULL,
	`tutor_id` varchar(36) NOT NULL,
	`title` varchar(255),
	`description` text,
	`start_time` timestamp(3) NOT NULL,
	`end_time` timestamp(3) NOT NULL,
	`meeting_link` varchar(255),
	`status` enum('scheduled','live','completed','cancelled') NOT NULL DEFAULT 'scheduled',
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `class_session_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course` (
	`id` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`code` varchar(50) NOT NULL,
	`tutor_id` varchar(36) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `course_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `enrollment` (
	`id` varchar(36) NOT NULL,
	`student_id` varchar(36) NOT NULL,
	`course_id` varchar(36) NOT NULL,
	`enrolled_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `enrollment_id` PRIMARY KEY(`id`),
	CONSTRAINT `enrollment_student_course_unique` UNIQUE(`student_id`,`course_id`)
);
--> statement-breakpoint
CREATE TABLE `session_resource` (
	`id` varchar(36) NOT NULL,
	`session_id` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`type` varchar(50) NOT NULL,
	`url` text NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `session_resource_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `class_session` ADD CONSTRAINT `class_session_course_id_course_id_fk` FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `class_session` ADD CONSTRAINT `class_session_tutor_id_user_id_fk` FOREIGN KEY (`tutor_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course` ADD CONSTRAINT `course_tutor_id_user_id_fk` FOREIGN KEY (`tutor_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `enrollment` ADD CONSTRAINT `enrollment_student_id_user_id_fk` FOREIGN KEY (`student_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `enrollment` ADD CONSTRAINT `enrollment_course_id_course_id_fk` FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_resource` ADD CONSTRAINT `session_resource_session_id_class_session_id_fk` FOREIGN KEY (`session_id`) REFERENCES `class_session`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
CREATE INDEX `class_session_course_id_idx` ON `class_session` (`course_id`);--> statement-breakpoint
CREATE INDEX `class_session_tutor_id_idx` ON `class_session` (`tutor_id`);--> statement-breakpoint
CREATE INDEX `enrollment_student_id_idx` ON `enrollment` (`student_id`);--> statement-breakpoint
CREATE INDEX `enrollment_course_id_idx` ON `enrollment` (`course_id`);--> statement-breakpoint
CREATE INDEX `session_resource_session_id_idx` ON `session_resource` (`session_id`);