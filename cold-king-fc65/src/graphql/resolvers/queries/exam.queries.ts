import gql from "graphql-tag";
import { GraphQLContext } from "../../../server";
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
            return context.db.select().from(exams).where(eq(exams.id, args.examId)).get()
        }
    }
}