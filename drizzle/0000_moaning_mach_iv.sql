CREATE TABLE `plan_responses` (
	`id` text PRIMARY KEY NOT NULL,
	`plan_id` text NOT NULL,
	`name` text NOT NULL,
	`available_dates` text NOT NULL,
	`edit_token` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `plan_responses_plan_id_idx` ON `plan_responses` (`plan_id`);--> statement-breakpoint
CREATE TABLE `plans` (
	`id` text PRIMARY KEY NOT NULL,
	`edit_token` text NOT NULL,
	`name` text NOT NULL,
	`num_days` integer NOT NULL,
	`start_range` text NOT NULL,
	`end_range` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
