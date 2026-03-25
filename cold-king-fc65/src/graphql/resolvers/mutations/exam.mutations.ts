import type { GraphQLContext } from "../../../server";
import { exams } from "../../../db/schemas/exam.schema";

export const examMutation = {
    Mutation: {
        createExam: async (
            _: unknown,
            args: {
                input: {
                    title: string;
                    subject: string;
                    description?: string | null;
                    duration: number;
                    grade: string;
                    openStatus?: boolean | null;
                    createdBy?: string | null;
                };
            },
            context: GraphQLContext,
        ) => {
            if (!context.auth.userId || !context.auth.isAuthenticated) {
                throw new Error("Unauthorized");
            }

            return context.db
                .insert(exams)
                .values({
                    id: crypto.randomUUID(),
                    title: args.input.title,
                    subject: args.input.subject,
                    description: args.input.description ?? null,
                    duration: args.input.duration,
                    grade: args.input.grade,
                    openStatus: args.input.openStatus ?? false,
                    createdBy: context.auth.userId,
                })
                .returning()
                .get();
        },
    },
};
