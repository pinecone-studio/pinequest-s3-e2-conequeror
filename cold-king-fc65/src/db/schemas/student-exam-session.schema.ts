import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { exams } from "./exam.schema";
import { students } from "./student.schema";

export const studentExamSessions = sqliteTable("student_exam_sessions", {
	id: text().primaryKey(),
	studentId: text()
		.notNull()
		.references(() => students.id, { onDelete: "cascade" }),
	examId: text()
		.notNull()
		.references(() => exams.id, { onDelete: "cascade" }),
	sessionId: text().notNull(),
	deviceId: text().notNull(),
	startedAt: int().notNull(),
	lastHeartbeatAt: int().notNull(),
	lastActionAt: int().notNull(),
	createdAt: int().notNull(),
	updatedAt: int().notNull(),
});
