import { studentMutation } from "./mutations/student.mutations";
import { teacherMutation } from "./mutations/teacher.mutations";

export const resolvers = [
	studentMutation,
	teacherMutation,
];
