import { schools } from "../../../db/schemas/school.schema";
import { isValidAimag } from "../../../domain/aimags";
import type { GraphQLContext } from "../../../server";

function normalizeSchoolEmail(email: string) {
	return email.trim().toLowerCase();
}

export const schoolMutation = {
	Mutation: {
		upsertSchool: async (
			_: unknown,
			args: {
				input: {
					schoolName: string;
					email: string;
					managerLastName: string;
					managerFirstName: string;
					aimag: string;
				};
			},
			context: GraphQLContext,
		) => {
			if (!context.auth.userId || !context.auth.isAuthenticated) {
				throw new Error("Unauthorized");
			}

			if (context.auth.role !== "school") {
				throw new Error("Only school accounts can register a school profile.");
			}

			const userId = context.auth.userId;
			const schoolName = args.input.schoolName.trim();
			const managerLastName = args.input.managerLastName.trim();
			const managerFirstName = args.input.managerFirstName.trim();
			const email = normalizeSchoolEmail(args.input.email);
			const aimag = args.input.aimag.trim();

			if (!schoolName || !managerLastName || !managerFirstName) {
				throw new Error("School name and manager name are required.");
			}

			if (!email.endsWith("@gmail.com")) {
				throw new Error("School manager email must be a Gmail address.");
			}

			if (!isValidAimag(aimag)) {
				throw new Error("Invalid aimag selection.");
			}

			const values = {
				schoolName,
				email,
				managerLastName,
				managerFirstName,
				aimag,
				createdAt: Date.now(),
			};

			return context.db
				.insert(schools)
				.values({
					id: userId,
					...values,
				})
				.onConflictDoUpdate({
					target: schools.id,
					set: values,
				})
				.returning()
				.get();
		},
	},
};
