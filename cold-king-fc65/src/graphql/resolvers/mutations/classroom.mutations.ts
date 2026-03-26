import { and, desc, eq } from "drizzle-orm";
import { classrooms } from "../../../db/schemas/classroom.schema";
import { teacherRequests } from "../../../db/schemas/teacherRequest.schema";
import type { GraphQLContext } from "../../../server";

function generateClassCode() {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let code = "";

	for (let i = 0; i < 6; i++) {
		code += chars[Math.floor(Math.random() * chars.length)];
	}

	return code;
}

export const classroomMutation = {
	Mutation: {
		createClassroom: async (
			_: unknown,
			args: {
				input: {
					className: string;
					schoolId?: string | null;
				};
			},
			context: GraphQLContext,
		) => {
			if (!context.auth.userId || !context.auth.isAuthenticated) {
				throw new Error("Unauthorized");
			}

			if (context.auth.role !== "teacher") {
				throw new Error("Only teacher accounts can create classrooms.");
			}

			const userId = context.auth.userId;
			const className = args.input.className.trim().toUpperCase();
			if (!className) {
				throw new Error("Class name is required.");
			}

			const preferredSchoolId = args.input.schoolId?.trim();
			const approvedFilter = preferredSchoolId
				? and(
						eq(teacherRequests.teacherId, userId),
						eq(teacherRequests.status, "APPROVED"),
						eq(teacherRequests.schoolId, preferredSchoolId),
					)
				: and(
						eq(teacherRequests.teacherId, userId),
						eq(teacherRequests.status, "APPROVED"),
					);
			const approvedRequest = await context.db
				.select()
				.from(teacherRequests)
				.where(approvedFilter)
				.orderBy(desc(teacherRequests.approvedAt))
				.get();

			if (!approvedRequest) {
				throw new Error(
					"You need an approved school request before creating a classroom.",
				);
			}

			for (let attempt = 0; attempt < 5; attempt += 1) {
				const classCode = generateClassCode();
				try {
					return await context.db
						.insert(classrooms)
						.values({
							id: crypto.randomUUID(),
							teacherId: userId,
							schoolId: approvedRequest.schoolId,
							schoolName: approvedRequest.schoolName,
							className,
							classCode,
							createdAt: Date.now(),
						})
						.returning()
						.get();
				} catch (error) {
					const message = error instanceof Error ? error.message : String(error);
					if (!message.toLowerCase().includes("unique")) {
						throw error;
					}
				}
			}

			throw new Error("Failed to generate a unique class code. Please retry.");
		},
	},
};
