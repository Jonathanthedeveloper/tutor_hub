ALTER TABLE `user` MODIFY COLUMN `role` varchar(50);--> statement-breakpoint
CREATE INDEX `user_role_idx` ON `user` (`role`);--> statement-breakpoint
CREATE INDEX `class_session_start_time_idx` ON `class_session` (`start_time`);--> statement-breakpoint
CREATE INDEX `course_tutor_id_idx` ON `course` (`tutor_id`);