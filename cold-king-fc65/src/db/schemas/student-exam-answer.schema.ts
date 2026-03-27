import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { questions } from "./question.schema";
import { studentExamSubmissions } from "./student-exam-submission.schema";

export const studentExamAnswers = sqliteTable("student_exam_answers", {
	id: text().primaryKey(),
	submissionId: text()
		.notNull()
		.references(() => studentExamSubmissions.id, { onDelete: "cascade" }),
	questionId: text()
		.notNull()
		.references(() => questions.id, { onDelete: "cascade" }),
	selectedChoiceId: text(),
	answerText: text(),
	isCorrect: int({ mode: "boolean" }).notNull(),
});
