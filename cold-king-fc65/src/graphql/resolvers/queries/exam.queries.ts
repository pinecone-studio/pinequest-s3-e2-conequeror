import type { GraphQLContext } from "../../../server";
import { exams } from "../../../db/schemas/exam.schema";
import { eq } from "drizzle-orm";


export const examQuery = {
    Query: {
        examById: async (_: any,
            args: {
                examId: string
            },
            context: GraphQLContext
        ) => {
            if (!context.auth.userId || !context.auth.isAuthenticated) {
                throw new Error("Unauthorized");
            }

            return context.db.select().from(exams).where(eq(exams.id, args.examId)).get()
        }
    }
}
