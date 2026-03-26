import { and, eq } from "drizzle-orm";
import { schools } from "../../../db/schemas/school.schema";
import { teachers } from "../../../db/schemas/teacher.schema";
import { teacherRequests } from "../../../db/schemas/teacherRequest.schema";
import type { GraphQLContext } from "../../../server";

export const teacherRequestMutation = {
	Mutation: {
		requestTeacherApproval: async (
			_: unknown,
			args: {
				input: {
					schoolId: string;
					subject?: string | null;
				};
			},
			context: GraphQLContext,
		) => {
			if (!context.auth.userId || !context.auth.isAuthenticated) {
				throw new Error("Unauthorized");
			}

			if (context.auth.role !== "teacher") {
				throw new Error("Only teacher accounts can send school requests.");
			}

			const userId = context.auth.userId;
			const schoolId = args.input.schoolId.trim();
			if (!schoolId) {
				throw new Error("School ID is required.");
			}

			const school = await context.db
				.select()
				.from(schools)
				.where(eq(schools.id, schoolId))
				.get();

			if (!school) {
				throw new Error("School not found.");
			}

			const teacher = await context.db
				.select()
				.from(teachers)
				.where(eq(teachers.id, userId))
				.get();

			if (!teacher) {
				throw new Error("Teacher profile not found.");
			}

			const subject = args.input.subject?.trim() || "GENERAL";
			const teacherName = `${teacher.lastName} ${teacher.firstName}`.trim();

			const existing = await context.db
				.select()
				.from(teacherRequests)
				.where(
					and(
						eq(teacherRequests.teacherId, userId),
						eq(teacherRequests.schoolId, schoolId),
					),
				)
				.get();

			if (existing) {
				if (existing.status === "APPROVED") {
					return existing;
				}

				return context.db
					.update(teacherRequests)
					.set({
						teacherName,
						teacherEmail: teacher.email,
						teacherPhone: teacher.phone,
						subject,
						schoolName: school.schoolName,
						status: "PENDING",
						createdAt: Date.now(),
						approvedAt: null,
						rejectedAt: null,
					})
					.where(eq(teacherRequests.id, existing.id))
					.returning()
					.get();
			}

			return context.db
				.insert(teacherRequests)
				.values({
					id: crypto.randomUUID(),
					teacherId: userId,
					teacherName,
					teacherEmail: teacher.email,
					teacherPhone: teacher.phone,
					subject,
					schoolId,
					schoolName: school.schoolName,
					status: "PENDING",
					createdAt: Date.now(),
					approvedAt: null,
					rejectedAt: null,
				})
				.returning()
				.get();
		},
		approveTeacherRequest: async (
			_: unknown,
			args: { input: { requestId: string } },
			context: GraphQLContext,
		) => {
			if (!context.auth.userId || !context.auth.isAuthenticated) {
				throw new Error("Unauthorized");
			}

			if (context.auth.role !== "school") {
				throw new Error("Only school accounts can approve teacher requests.");
			}

			const requestId = args.input.requestId.trim();
			if (!requestId) {
				throw new Error("Request ID is required.");
			}

			const request = await context.db
				.select()
				.from(teacherRequests)
				.where(
					and(
						eq(teacherRequests.id, requestId),
						eq(teacherRequests.schoolId, context.auth.userId),
					),
				)
				.get();

			if (!request) {
				throw new Error("Teacher request not found.");
			}

			if (request.status === "APPROVED") {
				return request;
			}

			return context.db
				.update(teacherRequests)
				.set({
					status: "APPROVED",
					approvedAt: Date.now(),
					rejectedAt: null,
				})
				.where(eq(teacherRequests.id, requestId))
				.returning()
				.get();
		},
		rejectTeacherRequest: async (
			_: unknown,
			args: { input: { requestId: string } },
			context: GraphQLContext,
		) => {
			if (!context.auth.userId || !context.auth.isAuthenticated) {
				throw new Error("Unauthorized");
			}

			if (context.auth.role !== "school") {
				throw new Error("Only school accounts can reject teacher requests.");
			}

			const requestId = args.input.requestId.trim();
			if (!requestId) {
				throw new Error("Request ID is required.");
			}

			const request = await context.db
				.select()
				.from(teacherRequests)
				.where(
					and(
						eq(teacherRequests.id, requestId),
						eq(teacherRequests.schoolId, context.auth.userId),
					),
				)
				.get();

			if (!request) {
				throw new Error("Teacher request not found.");
			}

			if (request.status === "REJECTED") {
				return request;
			}

			return context.db
				.update(teacherRequests)
				.set({
					status: "REJECTED",
					rejectedAt: Date.now(),
					approvedAt: null,
				})
				.where(eq(teacherRequests.id, requestId))
				.returning()
				.get();
		},
	},
};
