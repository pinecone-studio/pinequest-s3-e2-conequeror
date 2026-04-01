CREATE TABLE `student_exam_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`studentId` text NOT NULL,
	`examId` text NOT NULL,
	`sessionId` text NOT NULL,
	`deviceId` text NOT NULL,
	`startedAt` integer NOT NULL,
	`lastHeartbeatAt` integer NOT NULL,
	`lastActionAt` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`examId`) REFERENCES `exams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `student_exam_sessions_student_idx` ON `student_exam_sessions` (`studentId`);
--> statement-breakpoint
CREATE INDEX `student_exam_sessions_exam_idx` ON `student_exam_sessions` (`examId`);
