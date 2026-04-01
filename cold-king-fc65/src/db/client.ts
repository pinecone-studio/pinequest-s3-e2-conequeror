import * as classroomSchema from "./schemas/classroom.schema";
import * as choiceSchema from "./schemas/choices.schema";
import { drizzle } from "drizzle-orm/d1";
import * as examSchema from "./schemas/exam.schema";
import * as questionSchema from "./schemas/question.schema";
import * as studentExamAnswerSchema from "./schemas/student-exam-answer.schema";
import * as studentExamSessionSchema from "./schemas/student-exam-session.schema";
import * as studentExamSubmissionSchema from "./schemas/student-exam-submission.schema";
import * as studentSchema from "./schemas/student.schema";
import * as teacherSchema from "./schemas/teacher.schema";

const schema = {
	...classroomSchema,
	...choiceSchema,
	...examSchema,
	...questionSchema,
	...studentExamAnswerSchema,
	...studentExamSessionSchema,
	...studentExamSubmissionSchema,
	...studentSchema,
	...teacherSchema,
};

export function getDb(env: Pick<Env, "shalgalt_db">) {
	return drizzle(env.shalgalt_db, { schema });
}
