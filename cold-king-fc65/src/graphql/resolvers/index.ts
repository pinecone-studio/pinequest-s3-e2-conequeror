import { classroomMutation } from "./mutations/classroom.mutations";
import { examMutation } from "./mutations/exam.mutations";
import { schoolMutation } from "./mutations/school.mutations";
import { studentMutation } from "./mutations/student.mutations";
import { teacherMutation } from "./mutations/teacher.mutations";
import { teacherRequestMutation } from "./mutations/teacherRequest.mutations";
import { classRoomQuery } from "./queries/classroom.queries";
import { examQuery } from "./queries/exam.queries";
import { schoolQuery } from "./queries/school.queries";
import { teacherRequestQuery } from "./queries/teacherRequest.queries";

export const resolvers = [
	examQuery,
	examMutation,
	studentMutation,
	teacherMutation,
	classroomMutation,
	classRoomQuery,
	schoolQuery,
	schoolMutation,
	teacherRequestQuery,
	teacherRequestMutation,
];
