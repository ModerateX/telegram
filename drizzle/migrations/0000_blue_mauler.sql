CREATE TABLE `groups` (
	`id` integer PRIMARY KEY NOT NULL,
	`did` text,
	`did_doc` text,
	`role` text,
	`username` text,
	`name` text,
	`owner` integer,
	`last_name` text,
	`created_at` text DEFAULT '2025-05-12T00:37:26.706Z'
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`role` text,
	`group_id` integer,
	`user_id` integer,
	`username` text,
	`name` text,
	`created_at` text DEFAULT '2025-05-12T00:37:26.706Z'
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`key` text,
	`username` text,
	`first_name` text,
	`last_name` text,
	`created_at` text DEFAULT '2025-05-12T00:37:26.705Z'
);
