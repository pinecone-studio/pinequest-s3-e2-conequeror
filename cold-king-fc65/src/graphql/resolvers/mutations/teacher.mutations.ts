import { teachers } from "../../../db/schemas/teacher.schema";
import type { GraphQLContext } from "../../../server";

export const teacherMutation = {
	Mutation: {
		upsertTeacher: async (
			_: unknown,
			args: {
				input: {
					fullName: string;
					email: string;
					phone: string;
				};
			},
			context: GraphQLContext,
		) => {
			if (!context.auth.userId || !context.auth.isAuthenticated) {
				throw new Error("Unauthorized");
			}

			const inserted = await context.db
				.insert(teachers)
				.values({
					id: context.auth.userId,
					fullName: args.input.fullName,
					email: args.input.email,
					phone: args.input.phone,
				})
				.onConflictDoUpdate({
					target: teachers.id,
					set: {
						fullName: args.input.fullName,
						email: args.input.email,
						phone: args.input.phone,
					},
				})
				.returning()
				.get();

			return inserted;
		},
	},
};
