PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_groups` (
	`id` integer PRIMARY KEY NOT NULL,
	`did` text,
	`did_doc` text,
	`role` text,
	`verida` text,
	`username` text,
	`name` text,
	`owner` integer,
	`last_name` text,
	`created_at` text DEFAULT '2025-05-14T02:41:55.657Z'
);
--> statement-breakpoint
INSERT INTO `__new_groups`("id", "did", "did_doc", "role", "username", "name", "owner", "last_name", "created_at") SELECT "id", "did", "did_doc", "role", "username", "name", "owner", "last_name", "created_at" FROM `groups`;--> statement-breakpoint
DROP TABLE `groups`;--> statement-breakpoint
ALTER TABLE `__new_groups` RENAME TO `groups`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_members` (
	`id` text PRIMARY KEY NOT NULL,
	`role` text,
	`group_id` integer,
	`user_id` integer,
	`username` text,
	`name` text,
	`created_at` text DEFAULT '2025-05-14T02:41:55.657Z'
);
--> statement-breakpoint
INSERT INTO `__new_members`("id", "role", "group_id", "user_id", "username", "name", "created_at") SELECT "id", "role", "group_id", "user_id", "username", "name", "created_at" FROM `members`;--> statement-breakpoint
DROP TABLE `members`;--> statement-breakpoint
ALTER TABLE `__new_members` RENAME TO `members`;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY NOT NULL,
	`key` text,
	`username` text,
	`first_name` text,
	`last_name` text,
	`created_at` text DEFAULT '2025-05-14T02:41:55.656Z'
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "key", "username", "first_name", "last_name", "created_at") SELECT "id", "key", "username", "first_name", "last_name", "created_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;
