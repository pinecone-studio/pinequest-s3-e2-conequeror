import { eq } from "drizzle-orm";
import { schools } from "../../../db/schemas/school.schema";
import type { GraphQLContext } from "../../../server";

export const schoolQuery = {
	Query: {
		schools: async (_: unknown, _args: unknown, context: GraphQLContext) => {
			if (!context.auth.userId || !context.auth.isAuthenticated) {
				throw new Error("Unauthorized");
			}

			return context.db.select().from(schools).all();
		},
		mySchool: async (_: unknown, _args: unknown, context: GraphQLContext) => {
			if (!context.auth.userId || !context.auth.isAuthenticated) {
				throw new Error("Unauthorized");
			}

			if (context.auth.role !== "school") {
				return null;
			}

			return context.db
				.select()
				.from(schools)
				.where(eq(schools.id, context.auth.userId))
				.get();
		},
	},
};
