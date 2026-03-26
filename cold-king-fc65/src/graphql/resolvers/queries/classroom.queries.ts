import { eq } from "drizzle-orm";
import { classrooms } from "../../../db/schemas/classroom.schema";
import type { GraphQLContext } from "../../../server";

export const classRoomQuery = {
	Query: {
		classroomsByTeacher: async (
			_: unknown,
			_args: unknown,
			context: GraphQLContext,
		) => {
			const userId = context.auth.userId;

			if (!userId || !context.auth.isAuthenticated) {
				throw new Error("Unauthorized");
			}

			if (context.auth.role !== "teacher") {
				throw new Error("Only teacher accounts can view teacher classrooms.");
			}

			return context.db
				.select()
				.from(classrooms)
				.where(eq(classrooms.teacherId, userId))
				.all();
		},
	},
};
