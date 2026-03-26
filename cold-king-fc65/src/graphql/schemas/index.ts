import { classroomTypeDefs } from "./classroom.chema";
import { examTypeDefs } from "./exam.schema";
import { schoolTypeDefs } from "./school.schema";
import { studentTypeDefs } from "./student.schema";
import { teacherTypeDefs } from "./teacher.schema";
import { teacherRequestTypeDefs } from "./teacherRequest.schema";

export const typeDefs = [
	studentTypeDefs,
	teacherTypeDefs,
	schoolTypeDefs,
	teacherRequestTypeDefs,
	examTypeDefs,
	classroomTypeDefs,
];
