CREATE TABLE `schools` (
	`id` text PRIMARY KEY NOT NULL,
	`schoolName` text NOT NULL,
	`email` text NOT NULL,
	`managerLastName` text NOT NULL,
	`managerFirstName` text NOT NULL,
	`aimag` text NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `teacher_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`teacherId` text NOT NULL,
	`teacherName` text NOT NULL,
	`teacherEmail` text NOT NULL,
	`teacherPhone` text NOT NULL,
	`subject` text NOT NULL,
	`schoolId` text NOT NULL,
	`schoolName` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`createdAt` integer NOT NULL,
	`approvedAt` integer,
	`rejectedAt` integer
);
--> statement-breakpoint
ALTER TABLE `classrooms` ADD `schoolId` text;
--> statement-breakpoint
ALTER TABLE `classrooms` ADD `schoolName` text;
--> statement-breakpoint
ALTER TABLE `students` ADD `schoolId` text;
--> statement-breakpoint
ALTER TABLE `students` ADD `schoolName` text;
