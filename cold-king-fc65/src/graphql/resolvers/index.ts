import { examMutation } from "./mutations/exam.mutations";
import { schoolMutation } from "./mutations/school.mutations";
import { studentMutation } from "./mutations/student.mutations";
import { teacherMutation } from "./mutations/teacher.mutations";
import { examQuery } from "./queries/exam.queries";

export const resolvers = [
	examQuery,
	examMutation,
	schoolMutation,
	studentMutation,
	teacherMutation,
];
