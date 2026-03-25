import { getDb } from '../../../db/client';
import { students } from '../../../db/schemas/student.schema';

export const studentMutation = {
	Mutation: {
		upsertStudent: async (
			_: unknown,
			args: {
				input: {
					fullName: string;
					email: string;
					phone: string;
				};
			},
			context: { env: Env }
		) => {
			const db = getDb(context.env.DB);

			//add logic to grab clrk ID here.

			const inserted = await db
				.insert(students)
				.values({
					id: crypto.randomUUID(),
					fullName: args.input.fullName,
					email: args.input.email,
					phone: args.input.phone,
				})
				.returning()
				.get();

			return inserted
		},
	},
};
