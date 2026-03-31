CREATE TABLE `student_exam_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`studentId` text NOT NULL,
	`examId` text NOT NULL,
	`startedAt` integer NOT NULL,
	`submittedAt` integer NOT NULL,
	`totalQuestions` integer NOT NULL,
	`correctAnswers` integer NOT NULL,
	`scorePercent` integer NOT NULL,
	FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`examId`) REFERENCES `exams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `student_exam_answers` (
	`id` text PRIMARY KEY NOT NULL,
	`submissionId` text NOT NULL,
	`questionId` text NOT NULL,
	`selectedChoiceId` text,
	`answerText` text,
	`isCorrect` integer NOT NULL,
	FOREIGN KEY (`submissionId`) REFERENCES `student_exam_submissions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE cascade
);
