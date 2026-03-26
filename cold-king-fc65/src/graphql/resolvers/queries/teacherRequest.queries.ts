import { and, desc, eq } from "drizzle-orm";
import { teacherRequests } from "../../../db/schemas/teacherRequest.schema";
import type { GraphQLContext } from "../../../server";

type TeacherRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

function isTeacherRequestStatus(value: unknown): value is TeacherRequestStatus {
	return value === "PENDING" || value === "APPROVED" || value === "REJECTED";
}

export const teacherRequestQuery = {
	Query: {
		teacherRequestsForMySchool: async (
			_: unknown,
			args: { status?: string | null },
			context: GraphQLContext,
		) => {
			if (!context.auth.userId || !context.auth.isAuthenticated) {
				throw new Error("Unauthorized");
			}

			if (context.auth.role !== "school") {
				throw new Error("Only school accounts can view school teacher requests.");
			}

			const baseFilter = eq(teacherRequests.schoolId, context.auth.userId);
			const statusFilter = isTeacherRequestStatus(args.status)
				? eq(teacherRequests.status, args.status)
				: null;

			if (statusFilter) {
				return context.db
					.select()
					.from(teacherRequests)
					.where(and(baseFilter, statusFilter))
					.orderBy(desc(teacherRequests.createdAt))
					.all();
			}

			return context.db
				.select()
				.from(teacherRequests)
				.where(baseFilter)
				.orderBy(desc(teacherRequests.createdAt))
				.all();
		},
		myTeacherRequests: async (_: unknown, _args: unknown, context: GraphQLContext) => {
			if (!context.auth.userId || !context.auth.isAuthenticated) {
				throw new Error("Unauthorized");
			}

			if (context.auth.role !== "teacher") {
				throw new Error("Only teacher accounts can view teacher requests.");
			}

			return context.db
				.select()
				.from(teacherRequests)
				.where(eq(teacherRequests.teacherId, context.auth.userId))
				.orderBy(desc(teacherRequests.createdAt))
				.all();
		},
	},
};
